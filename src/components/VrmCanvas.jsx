import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';

const VrmCanvas = ({ onRegisterMouthControl, onModelLoaded }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup Scene, Kamera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, container.clientWidth / container.clientHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limiter agar tidak berat di HP Retina
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Pencahayaan
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(1, 2, 2);
    scene.add(dirLight);

    let mixer = null;
    let currentVrm = null;

    // State & Timer untuk Kedip Mata Otomatis
    let blinkTimeout = null;

    // Fungsi Kedip Mata Otomatis
    const triggerAutoBlink = (expressionManager) => {
      const blink = () => {
        if (!expressionManager) return;
        
        // Tutup mata
        expressionManager.setValue('blink', 1.0);

        // Buka mata kembali setelah 150ms
        setTimeout(() => {
          if (expressionManager) expressionManager.setValue('blink', 0.0);

          // Jadwalkan kedipan berikutnya secara acak antara 2 hingga 6 detik
          const nextBlinkTime = Math.random() * 4000 + 2000;
          blinkTimeout = setTimeout(blink, nextBlinkTime);
        }, 150);
      };

      blinkTimeout = setTimeout(blink, 3000);
    };

    // ==========================================
    // FUNGSI PENYESUAIAN POSISI MODEL KETIKA RESIZE
    // ==========================================
    const updateLayout = () => {
      if (!container) return;
      const width = window.innerWidth;

      // A. Kamera Aspect Ratio
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);

      if (!currentVrm) return;

      // B. Responsif Karakter Berdasarkan Perangkat
      if (width <= 768) {
        // MOBILE: Posisi Tengah Presisi, Kamera agak mundur/close-up pas di HP
        camera.position.set(0, 1.15, 2.2);
        currentVrm.scene.position.set(0.0, -0.42, 0); // Di tengah layar
        currentVrm.scene.rotation.y = 0.05; // Menghadap hampir lurus
        currentVrm.scene.scale.set(1.12, 1.12, 1.12);
      } else if (width <= 900) {
        // TABLET / TAB: Geser sedikit ke kanan tapi tidak sejauh desktop
        camera.position.set(0, 1.2, 2.1);
        currentVrm.scene.position.set(0.25, -0.4, 0);
        currentVrm.scene.rotation.y = -0.12;
        currentVrm.scene.scale.set(1.12, 1.12, 1.12);
      } else {
        // LAPTOP / DESKTOP: Posisi agak miring dan di kanan (seperti semula)
        camera.position.set(0, 1.25, 2.0);
        currentVrm.scene.position.set(0.55, -0.4, 0);
        currentVrm.scene.rotation.y = -0.2;
        currentVrm.scene.scale.set(1.2, 1.2, 1.2);
      }
    };

    // 2. Load Model VRM
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load('/FemaleSchool.vrm', (gltf) => {
      const vrm = gltf.userData.vrm;
      currentVrm = vrm;
      VRMUtils.removeUnnecessaryJoints(gltf.scene);

      scene.add(vrm.scene);

      // Terapkan penyesuaian posisi & skala pertama kali sesuai ukuran layar
      updateLayout();

      mixer = new THREE.AnimationMixer(vrm.scene);
      const exp = vrm.expressionManager;

      // Aktifkan Fitur Kedip Otomatis
      if (exp) {
        triggerAutoBlink(exp);
        exp.setValue('relaxed', 0.5);
      }

      // Aktifkan Gerakan Mulut Berbicara Mengikuti Teks
      if (exp && onRegisterMouthControl) {
        onRegisterMouthControl((durationMs) => {
          const mouthShapes = ['aa', 'ih', 'ou', 'ee', 'oh'];
          let step = 0;
          const startTime = Date.now();

          const animateTalkingMouth = () => {
            const elapsed = Date.now() - startTime;

            if (elapsed < durationMs) {
              mouthShapes.forEach((shape) => exp.setValue(shape, 0));

              const currentShape = mouthShapes[step % mouthShapes.length];
              const intensity = 0.4 + Math.random() * 0.5;

              exp.setValue(currentShape, intensity);
              step++;

              setTimeout(animateTalkingMouth, 90);
            } else {
              mouthShapes.forEach((shape) => exp.setValue(shape, 0));
            }
          };

          animateTalkingMouth();
        });
      }

      // Load Animasi Idle (VRMA)
      const animLoader = new GLTFLoader();
      animLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      animLoader.load('/VRMA/idle.vrma', (animGltf) => {
        const vrmAnim = animGltf.userData.vrmAnimations?.[0];
        if (vrmAnim) {
          const clip = createVRMAnimationClip(vrmAnim, vrm);
          mixer.clipAction(clip).play();
        }
      });

      if (onModelLoaded) {
        onModelLoaded();
      }
    });

    // Loop Animasi Canvas
    const clock = new THREE.Clock();
    let reqId;
    function animate() {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (currentVrm) currentVrm.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    // Attach Resize Event Listener
    window.addEventListener('resize', updateLayout);

    // Cleanup saat unmount
    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', updateLayout);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default VrmCanvas;