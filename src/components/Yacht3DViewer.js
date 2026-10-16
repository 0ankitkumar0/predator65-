
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Yacht3DViewer.css';

function Yacht3DViewer() {
  // Reference to the HTML container.
  const containerRef = useRef(null);

  // Track the loading status of the 3D model.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let stopped = false;
    let animationId;
    let model = null;
    let renderer;

    // 1. CREATE SCENE AND CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#edf2f5');

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
    camera.position.set(10, 6, 10);

    // 2. CREATE 3D RENDERER
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (error) {
      setStatus('error');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    // 3. ADD LIGHTS
    // Lights make the yacht clearly visible.
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8494a5, 2));

    const sunlight = new THREE.DirectionalLight(0xffffff, 3);
    sunlight.position.set(15, 25, 15);
    scene.add(sunlight);

    // 4. ENABLE MOUSE CONTROLS
    // Users can rotate and zoom, but cannot pan the model.
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;  // dont stop instantly when mouse stops
    controls.dampingFactor = 0.07;  // damping speed
    controls.enableRotate = true;   // enable rotate
    controls.enableZoom = true;   // enable zoom
    controls.enablePan = false;   // disable pan
    controls.minPolarAngle = 0.1;   // minimum CAMERA ROTATION ANGLE
    controls.maxPolarAngle = Math.PI - 0.1;   // maximum CAMERA ROTATION ANGLE

  
   
    function fitModel() {
      if (!model) return;

      const box = new THREE.Box3().setFromObject(model);  // BOX AROUND MODEL
      if (box.isEmpty()) return;

      camera.zoom = 1;   //intial zoom
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      // Check all 8 corners of the model's bounding box.
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            const point = new THREE.Vector3(x, y, z).project(camera);

            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
          }
        }
      }

      const width = (maxX - minX) / 2;
      const height = (maxY - minY) / 2;

      if (width > 0 && height > 0) {      // set zooom according to model 
        camera.zoom = THREE.MathUtils.clamp(Math.min(0.78 / width, 0.72 / height), 0.7, 5);
      }

      camera.updateProjectionMatrix();  // update zoom
    }

    // 6. MAKE THE VIEWER RESPONSIVE
    // Update the canvas when its container size changes.
    function resizeViewer() {
      if (stopped) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      if (model) fitModel();
    }

    resizeViewer();

    const resizeObserver = new ResizeObserver(resizeViewer);
    resizeObserver.observe(container);

    // 7. LOAD THE YACHT GLB MODEL
    const loader = new GLTFLoader();

    loader.load('/models/yacht.glb',

      (gltf) => {
        if (stopped) return;

        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);

        if (box.isEmpty()) {
          setStatus('error');
          return;
        }

        // Move the model to the center of the scene.
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        scene.add(model);

        // Calculate camera distance using model dimensions.
        const largest = Math.max(size.x, size.y, size.z, 0.01);
        const fov = (camera.fov * Math.PI) / 180;
        const distance = (largest * 1.5) / (2 * Math.tan(fov / 2));

        // Set the original camera angle and zoom limits.
        camera.position.set(
          distance * 0.75,
          distance * 0.45,
          distance * 0.85
        );

        camera.near = Math.max(distance / 1000, 0.01);  // camera near view 
        camera.far = Math.max(distance * 20, 100);    // camera far view
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.minDistance = Math.max(distance * 0.25, 0.1);
        controls.maxDistance = distance * 4;
        controls.update();

        fitModel();
        setStatus('ready');
      },

      undefined,

      (error) => {
        if (stopped) return;

        console.error('Error loading yacht GLB:', error);
        setStatus('error');
      }
    );

    // 8. RENDER ANIMATION
    // Keep updating the scene for smooth rotation and zoom.
    function animate() {
      if (stopped) return;

      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // 9. CLEAN UP RESOURCES
    // Remove the renderer and free memory when the component unmounts.
    return () => {
      stopped = true;

      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();

      if (model) {
        model.traverse((object) => {
          if (!object.isMesh) return;

          if (object.geometry) object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (material) material.dispose();
          });
        });
      }

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 10. DISPLAY THE 3D VIEWER
  return (
    <section
      className="yacht-3d-section"
      aria-label="Interactive yacht 3D model"
    >
      <div className="yacht-3d-container" ref={containerRef}>

        {/* Show a loader until the yacht is ready. */}
        {status === 'loading' && (
          <div className="yacht-3d-message">
            <div className="yacht-3d-spinner"></div>
            <span>Loading 3D Yacht...</span>
          </div>
        )}

        {/* Show an error if the model fails to load. */}
        {status === 'error' && (
          <div className="yacht-3d-message yacht-3d-error">
            Unable to load 3D yacht model.
            Check public/models/yacht.glb
          </div>
        )}
      </div>
    </section>
  );
}

export default Yacht3DViewer;
