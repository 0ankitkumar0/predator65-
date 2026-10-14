
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import './Yacht3DViewer.css';

function Yacht3DViewer() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let disposed = false;
    let animationId;
    let loadedModel = null;
    let renderer;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#edf2f5');

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100000
    );

    camera.position.set(10, 6, 10);

    // RENDERER
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true
      });
    } catch (error) {
      setStatus('error');
      return;
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      1.5
    );

    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0x8494a5,
      2
    );

    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    directionalLight.position.set(15, 25, 15);
    scene.add(directionalLight);

    // CONTROLS
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI - 0.1;

    // AUTO FIT MODEL TO VIEWER
    function fitModelToViewer() {
      if (!loadedModel) return;

      const bounds = new THREE.Box3().setFromObject(
        loadedModel
      );

      if (bounds.isEmpty()) return;

      // Reset camera zoom before calculating model size
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      const min = bounds.min;
      const max = bounds.max;

      // All 8 corners of the model bounding box
      const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z)
      ];

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      corners.forEach((corner) => {
        const projected = corner.project(camera);

        minX = Math.min(minX, projected.x);
        maxX = Math.max(maxX, projected.x);

        minY = Math.min(minY, projected.y);
        maxY = Math.max(maxY, projected.y);
      });

      // Percentage of viewer currently occupied
      const currentWidth = (maxX - minX) / 2;
      const currentHeight = (maxY - minY) / 2;

      // Desired size inside viewer
      const targetWidth = 0.78;
      const targetHeight = 0.72;

      if (currentWidth > 0 && currentHeight > 0) {
        const zoomToWidth = targetWidth / currentWidth;
        const zoomToHeight = targetHeight / currentHeight;

        const idealZoom = Math.min(
          zoomToWidth,
          zoomToHeight
        );

        camera.zoom = THREE.MathUtils.clamp(
          idealZoom,
          0.7,
          5
        );
      }

      camera.updateProjectionMatrix();
    }

    // RESPONSIVE RESIZE
    function resizeViewer() {
      if (!renderer || disposed) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);

      if (loadedModel) {
        fitModelToViewer();
      }
    }

    resizeViewer();

    const resizeObserver = new ResizeObserver(
      resizeViewer
    );

    resizeObserver.observe(container);

    // LOAD GLB MODEL
    const loader = new GLTFLoader();

    loader.load(
      '/models/yacht.glb',

      (gltf) => {
        if (disposed) return;

        loadedModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(
          loadedModel
        );

        if (box.isEmpty()) {
          setStatus('error');
          return;
        }

        const center = box.getCenter(
          new THREE.Vector3()
        );

        const size = box.getSize(
          new THREE.Vector3()
        );

        // CENTER MODEL
        loadedModel.position.sub(center);

        scene.add(loadedModel);

        // GET MODEL DIMENSIONS
        const largestDimension = Math.max(
          size.x,
          size.y,
          size.z,
          0.01
        );

        const verticalFov =
          (camera.fov * Math.PI) / 180;

        const distance =
          (largestDimension * 1.5) /
          (2 * Math.tan(verticalFov / 2));

        // INITIAL CAMERA ANGLE
        camera.position.set(
          distance * 0.75,
          distance * 0.45,
          distance * 0.85
        );

        camera.near = Math.max(
          distance / 1000,
          0.01
        );

        camera.far = Math.max(
          distance * 20,
          100
        );

        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);

        controls.minDistance = Math.max(
          distance * 0.25,
          0.1
        );

        controls.maxDistance = distance * 4;

        controls.update();

        // AUTOMATIC INITIAL ZOOM
        fitModelToViewer();

        setStatus('ready');
      },

      undefined,

      (error) => {
        if (!disposed) {
          console.error(
            'Error loading yacht GLB:',
            error
          );

          setStatus('error');
        }
      }
    );

    // ANIMATION
    function animate() {
      if (disposed) return;

      animationId = requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    }

    animate();

    // CLEANUP
    return () => {
      disposed = true;

      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();

      if (loadedModel) {
        loadedModel.traverse((object) => {
          if (!object.isMesh) return;

          if (object.geometry) {
            object.geometry.dispose();
          }

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (material) {
              material.dispose();
            }
          });
        });
      }

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      className="yacht-3d-section"
      aria-label="Interactive yacht 3D model"
    >
      <div
        className="yacht-3d-container"
        ref={containerRef}
      >
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
