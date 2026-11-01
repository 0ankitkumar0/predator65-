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

// Shared setup for both default and uploaded GLB viewers
function createViewer(container, source, viewerRef, setStatus, uploaded = false) {
  let stopped = false;
  let animationId;
  let model = null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#edf2f5');

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100000);
  camera.position.set(10, 6, 10);

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (error) {
    setStatus('error');
    return () => {};
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
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minPolarAngle = 0.1;
  controls.maxPolarAngle = Math.PI - 0.1;

  viewerRef.current = { camera, controls };

  // Automatically fit the model inside the viewer
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
        Math.min(
          (uploaded ? 0.84 : 0.78) / width,
          (uploaded ? 0.80 : 0.72) / height
        ),
        0.7,
        uploaded ? 8 : 5
      );
    }

    camera.updateProjectionMatrix();
  }

  // Responsive canvas
  function resizeViewer() {
    if (stopped || !container.clientWidth || !container.clientHeight) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
      container.clientWidth,
      container.clientHeight,
      false
    );

    if (model) fitModel();
  }

  resizeViewer();

  const observer = new ResizeObserver(resizeViewer);
  observer.observe(container);

  // Dispose 3D resources
  function disposeModel(root) {
    if (!root) return;

    root.traverse((object) => {
      if (!object.isMesh) return;

      object.geometry?.dispose();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => material?.dispose());
    });
  }

  // Load default URL or selected local file
  const url = typeof source === 'string'
    ? source
    : URL.createObjectURL(source);

  new GLTFLoader().load(url, (gltf) => {
    if (stopped) {
      disposeModel(gltf.scene);
      return;
    }

    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);

    if (box.isEmpty()) {
      setStatus('error');
      return;
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(
      box.getBoundingSphere(new THREE.Sphere()).radius,
      0.01
    );

    model.position.sub(center);
    scene.add(model);

    const fov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(
      Math.tan(fov / 2) * camera.aspect
    );

    // Keep original default fitting; improve uploaded model sizing
    const distance = uploaded
      ? radius * 1.1 / Math.sin(Math.min(fov, horizontalFov) / 2)
      : (Math.max(size.x, size.y, size.z, 0.01) * 1.5) /
        (2 * Math.tan(fov / 2));

    camera.position.set(
      distance * 0.75,
      distance * 0.45,
      distance * 0.85
    );

    camera.near = Math.max(distance / 1000, 0.01);
    camera.far = Math.max(distance * 20, 100);
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.minDistance = uploaded
      ? Math.max(radius * 0.25, 0.01)
      : Math.max(distance * 0.25, 0.1);
    controls.maxDistance = distance * 4;
    controls.update();

    fitModel();
    setStatus('ready');

  }, undefined, (error) => {
    if (stopped) return;
    console.error('Error loading GLB:', error);
    setStatus('error');
  });

  // Animation loop
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
    disposeModel(model);
    renderer.dispose();

    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }

    if (typeof source !== 'string') URL.revokeObjectURL(url);
  };
}

function Yacht3DViewer() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  const uploadContainerRef = useRef(null);
  const uploadViewerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');

  // Default yacht viewer
  useEffect(() => {
    if (!containerRef.current) return;

    return createViewer(
      containerRef.current,
      '/models/yacht.glb',
      viewerRef,
      setStatus
    );
  }, []);

  // Uploaded GLB viewer
  useEffect(() => {
    if (!uploadFile || !uploadContainerRef.current) return;

    return createViewer(
      uploadContainerRef.current,
      uploadFile,
      uploadViewerRef,
      setUploadStatus,
      true
    );
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

  // Select GLB file
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

  // Reset uploaded preview
  function resetUpload() {
    setUploadFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Upload arrow icon
  const uploadIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V3" />
      <path d="m6 9 6-6 6 6" />
      <path d="M4 17v4h16v-4" />
    </svg>
  );

  return (
    <section className="yacht-3d-section" aria-label="Interactive yacht 3D model">

      {/* DEFAULT YACHT VIEWER */}
      <div className="yacht-3d-container" ref={containerRef}>
        {status === 'ready' && (
          <div className="yacht-3d-controls">
            {buttons.map((btn) => (
              <button key={btn.type} type="button"
                title={btn.label} aria-label={btn.label}
                onClick={() => handleControl(btn.type)}>
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

      {/* UPLOAD GLB SECTION */}
      <div className="yacht-upload-section">

        <div className="yacht-upload-header">
          <div>
            <h3>Upload Your 3D Model</h3>
            <p>Upload a GLB file to view and interact with your own 3D model.</p>
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

        <div className="yacht-upload-preview" ref={uploadContainerRef}>

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
              Unable to load this model. Please select a valid .glb file.
            </div>
          )}

          {uploadStatus === 'ready' && (
            <div className="yacht-3d-controls">
              {buttons.map((btn) => (
                <button key={btn.type} type="button"
                  title={btn.label} aria-label={btn.label}
                  onClick={() => handleControl(btn.type, 'upload')}>
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