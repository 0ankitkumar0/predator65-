import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Yacht3DViewer.css';

function Yacht3DViewer() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let stopped = false;
    let animationId;
    let model = null;
    let renderer;

    // Create scene and camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#edf2f5');

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
    camera.position.set(10, 6, 10);

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

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8494a5, 2));

    const sunlight = new THREE.DirectionalLight(0xffffff, 3);
    sunlight.position.set(15, 25, 15);
    scene.add(sunlight);

    // Mouse controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI - 0.1;

    viewerRef.current = { camera, controls };

    // Fit model inside viewer
    function fitModel() {
      if (!model) return;

      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) return;

      camera.zoom = 1;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            const p = new THREE.Vector3(x, y, z).project(camera);
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          }
        }
      }

      const width = (maxX - minX) / 2;
      const height = (maxY - minY) / 2;

      if (width > 0 && height > 0) {
        camera.zoom = THREE.MathUtils.clamp(
          Math.min(0.78 / width, 0.72 / height), 0.7, 5
        );
      }
      camera.updateProjectionMatrix();
    }

    // Responsive canvas
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

    const observer = new ResizeObserver(resizeViewer);
    observer.observe(container);

    // Load GLB yacht model
    const loader = new GLTFLoader();

    loader.load('/models/yacht.glb', (gltf) => {
      if (stopped) return;

      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);

      if (box.isEmpty()) {
        setStatus('error');
        return;
      }

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.sub(center);
      scene.add(model);

      const largest = Math.max(size.x, size.y, size.z, 0.01);
      const fov = (camera.fov * Math.PI) / 180;
      const distance = (largest * 1.5) / (2 * Math.tan(fov / 2));

      camera.position.set(
        distance * 0.75, distance * 0.45, distance * 0.85
      );

      camera.near = Math.max(distance / 1000, 0.01);
      camera.far = Math.max(distance * 20, 100);
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.minDistance = Math.max(distance * 0.25, 0.1);
      controls.maxDistance = distance * 4;
      controls.update();

      fitModel();
      setStatus('ready');

    }, undefined, (error) => {
      if (stopped) return;
      console.error('Error loading yacht GLB:', error);
      setStatus('error');
    });

    // Render animation
    function animate() {
      if (stopped) return;
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      stopped = true;
      cancelAnimationFrame(animationId);
      observer.disconnect();
      controls.dispose();
      viewerRef.current = null;

      if (model) {
        model.traverse((object) => {
          if (!object.isMesh) return;
          object.geometry?.dispose();

          const materials = Array.isArray(object.material)
            ? object.material : [object.material];

          materials.forEach((material) => material?.dispose());
        });
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Manual rotate and zoom buttons
  function handleControl(type) {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const { camera, controls } = viewer;
    const offset = camera.position.clone().sub(controls.target);

    if (type === 'left' || type === 'right') {
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        type === 'left' ? 0.25 : -0.25
      );
    } else {
      const distance = THREE.MathUtils.clamp(
        offset.length() * (type === 'in' ? 0.8 : 1.25),
        controls.minDistance,
        controls.maxDistance
      );
      offset.setLength(distance);
    }

    camera.position.copy(controls.target).add(offset);
    controls.update();
  }

  return (
    <section className="yacht-3d-section" aria-label="Interactive yacht 3D model">
      <div className="yacht-3d-container" ref={containerRef}>

        {status === 'ready' && (
          <div className="yacht-3d-controls">
            {[
              { type: 'left', icon: '↶', label: 'Rotate Left' },
              { type: 'right', icon: '↷', label: 'Rotate Right' },
              { type: 'in', icon: '+', label: 'Zoom In' },
              { type: 'out', icon: '−', label: 'Zoom Out' }
            ].map((btn) => (
              <button
                key={btn.type}
                type="button"
                title={btn.label}
                aria-label={btn.label}
                onClick={() => handleControl(btn.type)}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}

        {status === 'loading' && (
          <div className="yacht-3d-message">
            <div className="yacht-3d-spinner"></div>
            <span>Loading 3D Yacht...</span>
          </div>
        )}

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