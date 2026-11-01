import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Yacht3DViewer.css';

const buttons = [
  { type: 'left', icon: '↶', label: 'Rotate Left' },
  { type: 'right', icon: '↷', label: 'Rotate Right' },
  { type: 'in', icon: '+', label: 'Zoom In' },
  { type: 'out', icon: '−', label: 'Zoom Out' }
];

function Yacht3DViewer() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  // Uploaded model references
  const uploadContainerRef = useRef(null);
  const uploadViewerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');

  // Upload button icon
  const uploadIcon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V3" />
      <path d="m6 9 6-6 6 6" />
      <path d="M4 17v4h16v-4" />
    </svg>
  );

  // DEFAULT YACHT VIEWER
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

    // Load default GLB
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
        distance * 0.75,
        distance * 0.45,
        distance * 0.85
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

    // Animation
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

  // UPLOADED GLB VIEWER
  useEffect(() => {
    const container = uploadContainerRef.current;
    if (!uploadFile || !container) return;

    let stopped = false;
    let animationId;
    let model = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#edf2f5');

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (error) {
      setUploadStatus('error');
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

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(15, 25, 15);
    scene.add(light);

    // Mouse controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI - 0.1;

    uploadViewerRef.current = { camera, controls };

    // Responsive viewer
    function resizeViewer() {
      if (stopped || !container.clientWidth || !container.clientHeight) return;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight,
        false
      );
    }

    resizeViewer();

    const observer = new ResizeObserver(resizeViewer);
    observer.observe(container);

    // Dispose uploaded model
    function disposeModel(root) {
      if (!root) return;

      root.traverse((object) => {
        if (!object.isMesh) return;

        object.geometry?.dispose();

        const materials = Array.isArray(object.material)
          ? object.material : [object.material];

        materials.forEach((material) => material?.dispose());
      });
    }

    // Load uploaded file locally
    const url = URL.createObjectURL(uploadFile);

    new GLTFLoader().load(url, (gltf) => {
      if (stopped) {
        disposeModel(gltf.scene);
        return;
      }

      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);

      if (box.isEmpty()) {
        setUploadStatus('error');
        return;
      }

      const center = box.getCenter(new THREE.Vector3());
      const radius = Math.max(
        box.getBoundingSphere(new THREE.Sphere()).radius,
        0.01
      );

      model.position.sub(center);
      scene.add(model);

      // Auto fit uploaded model
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(
        Math.tan(verticalFov / 2) * camera.aspect
      );

      const distance = radius * 0.65 /
        Math.sin(Math.min(verticalFov, horizontalFov) / 2);

      camera.position.set(
        distance * 0.75,
        distance * 0.45,
        distance * 0.85
      );

      camera.near = Math.max(distance / 1000, 0.01);
      camera.far = Math.max(distance * 20, 100);
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.minDistance = Math.max(radius * 0.25, 0.01);
      controls.maxDistance = distance * 4;
      controls.update();

      setUploadStatus('ready');

    }, undefined, (error) => {
      if (stopped) return;
      console.error('Uploaded GLB error:', error);
      setUploadStatus('error');
    });

    // Animation
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
      uploadViewerRef.current = null;

      disposeModel(model);
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      URL.revokeObjectURL(url);
    };
  }, [uploadFile]);

  // Manual controls for both viewers
  function handleControl(type, target = 'default') {
    const viewer = target === 'upload'
      ? uploadViewerRef.current
      : viewerRef.current;

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

  // Upload GLB
  function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb')) {
      setUploadFile(null);
      setUploadStatus('error');
      return;
    }

    setUploadStatus('loading');
    setUploadFile(file);
  }

  // Reset uploaded model
  function resetUpload() {
    setUploadFile(null);
    setUploadStatus('idle');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <section
      className="yacht-3d-section"
      aria-label="Interactive yacht 3D model"
    >

      {/* DEFAULT YACHT VIEWER */}
      <div className="yacht-3d-container" ref={containerRef}>

        {status === 'ready' && (
          <div className="yacht-3d-controls">
            {buttons.map((btn) => (
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

      {/* NEW GLB UPLOAD SECTION */}
      <div className="yacht-upload-section">

        <div className="yacht-upload-header">
          <div>
            <h3>Upload Your 3D Model</h3>
            <p>
              Upload a GLB file to view and interact with your own 3D model.
            </p>
          </div>

          <div className="yacht-upload-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,model/gltf-binary"
              hidden
              onChange={handleUpload}
              aria-label="Choose GLB model"
            />

            <button
              type="button"
              className="yacht-reset-btn"
              onClick={resetUpload}
              disabled={uploadStatus === 'idle'}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Upload preview box */}
        <div
          className="yacht-upload-preview"
          ref={uploadContainerRef}
        >

          {/* Top-right upload button after selecting a model */}
          {uploadStatus !== 'idle' && (
            <button
              type="button"
              className="yacht-upload-btn yacht-upload-floating-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadIcon}
              <span>Upload GLB</span>
            </button>
          )}

          {/* Center upload button before selecting a model */}
          {uploadStatus === 'idle' && (
            <div className="yacht-upload-placeholder">

              <button
                type="button"
                className="yacht-upload-btn yacht-upload-center-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadIcon}
                <span>Upload GLB</span>
              </button>

              <strong>No model uploaded</strong>
              <span>Select a .glb file to preview it here.</span>
            </div>
          )}

          {uploadStatus === 'loading' && (
            <div className="yacht-3d-message">
              <div className="yacht-3d-spinner"></div>
              <span>Loading Uploaded GLB...</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="yacht-3d-message yacht-3d-error">
              Unable to load this model.
              Please select a valid .glb file.
            </div>
          )}

          {/* Uploaded model manual controls */}
          {uploadStatus === 'ready' && (
            <div className="yacht-3d-controls">
              {buttons.map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  title={btn.label}
                  aria-label={btn.label}
                  onClick={() => handleControl(btn.type, 'upload')}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

    </section>
  );
}

export default Yacht3DViewer;