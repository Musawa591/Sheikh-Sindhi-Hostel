/* ==========================================================================
   Shaikh Abdul Majeed Sindhi Boys Hostel - MUET Jamshoro
   Interactive Logic, Theme Switcher & Three.js 3D Room Viewer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. DUAL THEME SWITCHER LOGIC (Brown & White)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeLabel = themeToggleBtn.querySelector('.theme-label');
  const htmlElement = document.documentElement;

  // Read the saved theme or default to the light theme
  const savedTheme = localStorage.getItem('hostel_theme') || 'white';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'brown' ? 'white' : 'brown';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('hostel_theme', theme);
    if (theme === 'white') {
      themeLabel.textContent = 'White Theme';
    } else {
      themeLabel.textContent = 'Brown Theme';
    }
  }

  // Mobile navigation
  const navToggle = document.getElementById('navToggle');
  const primaryNavigation = document.getElementById('primaryNavigation');

  if (navToggle && primaryNavigation) {
    const closeNavigation = () => {
      primaryNavigation.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = primaryNavigation.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      navToggle.innerHTML = `<i class="fa-solid fa-${isOpen ? 'xmark' : 'bars'}" aria-hidden="true"></i>`;
    });

    primaryNavigation.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNavigation);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) closeNavigation();
    });
  }

  // 2. 3D CARD TILT EFFECT ON MOUSEMOVE
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // 3. STATISTICAL COUNTER ANIMATION
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const speed = target / 50;

      const updateCount = () => {
        count += speed;
        if (count < target) {
          counter.innerText = Math.ceil(count);
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + (target === 100 ? '%' : '+');
        }
      };
      updateCount();
    });
  };

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-bar');
    if (!statsSection) return;
    const pos = statsSection.getBoundingClientRect().top;
    if (pos < window.innerHeight && !animated) {
      animated = true;
      animateCounters();
    }
  });

  // 4. THREE.JS 3D ROOM VISUALIZER
  initThreeJSVisualizer();

  function initThreeJSVisualizer() {
    const container = document.getElementById('threejs-container');
    const loader = document.getElementById('canvasLoader');
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x140c08);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Hide loader once canvas renders
    if (loader) loader.style.display = 'none';

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd4a359, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Group for holding room objects
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Build 3D Room Floor & Furniture
    function buildRoom(roomType) {
      // Clear previous models
      while (roomGroup.children.length > 0) {
        roomGroup.remove(roomGroup.children[0]);
      }

      // Room Base Floor
      const floorGeo = new THREE.BoxGeometry(8, 0.3, 8);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.4 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.15;
      roomGroup.add(floor);

      // Back Wall
      const wallGeo = new THREE.BoxGeometry(8, 4, 0.2);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x54392a });
      const backWall = new THREE.Mesh(wallGeo, wallMat);
      backWall.position.set(0, 2, -3.9);
      roomGroup.add(backWall);

      // Side Wall
      const sideWallGeo = new THREE.BoxGeometry(0.2, 4, 8);
      const sideWall = new THREE.Mesh(sideWallGeo, wallMat);
      sideWall.position.set(-3.9, 2, 0);
      roomGroup.add(sideWall);

      // Add Beds based on selection
      const bedCount = roomType === 'single' ? 1 : roomType === 'double' ? 2 : 3;
      const bedPositions = [
        { x: -2, z: -2 },
        { x: 2, z: -2 },
        { x: 2, z: 2 }
      ];

      for (let i = 0; i < bedCount; i++) {
        createBed(bedPositions[i].x, bedPositions[i].z);
      }

      // Add Study Desk & Chair
      createDesk(-2, 1.8);
    }

    // Helper: Create 3D Bed Mesh
    function createBed(x, z) {
      const bedFrameGeo = new THREE.BoxGeometry(2.2, 0.6, 3.8);
      const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
      const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
      bedFrame.position.set(x, 0.3, z);

      const mattressGeo = new THREE.BoxGeometry(2, 0.4, 3.6);
      const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6 });
      const mattress = new THREE.Mesh(mattressGeo, mattressMat);
      mattress.position.set(x, 0.7, z);

      const pillowGeo = new THREE.BoxGeometry(1.4, 0.2, 0.8);
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xd4a359 });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(x, 0.9, z - 1.2);

      roomGroup.add(bedFrame);
      roomGroup.add(mattress);
      roomGroup.add(pillow);
    }

    // Helper: Create 3D Desk Mesh
    function createDesk(x, z) {
      const deskGeo = new THREE.BoxGeometry(2.5, 1.2, 1.4);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(x, 0.6, z);

      const chairGeo = new THREE.BoxGeometry(1, 1.4, 1);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e130c });
      const chair = new THREE.Mesh(chairGeo, chairMat);
      chair.position.set(x, 0.7, z - 1.2);

      roomGroup.add(desk);
      roomGroup.add(chair);
    }

    // Build initial Single Room
    buildRoom('single');

    // Smooth Slow Auto-Rotation
    function animate() {
      requestAnimationFrame(animate);
      roomGroup.rotation.y += 0.004;
      renderer.render(scene, camera);
    }
    animate();

    // Mouse Drag Rotation Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      roomGroup.rotation.y += deltaMove.x * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Handle Room Selection Buttons
    const roomButtons = document.querySelectorAll('.room-btn');
    const roomName = document.getElementById('roomName');
    const roomDimensions = document.getElementById('roomDimensions');
    const roomFeatures = document.getElementById('roomFeatures');

    const roomDetailsMap = {
      single: {
        title: 'Single Student Suite',
        dims: 'Size: 12ft x 14ft | Balcony View',
        features: ['Private Study Desk', 'Single Bed', 'Personal Wardrobe']
      },
      double: {
        title: '2-Bed Shared Room',
        dims: 'Size: 16ft x 16ft | Attached Bath',
        features: ['Dual Study Tables', 'Twin Beds', 'Shared Storage']
      },
      triple: {
        title: '3-Bed Shared Room',
        dims: 'Size: 20ft x 18ft | Garden Facing',
        features: ['3 Study Stations', '3 Beds', 'Large Wardrobe']
      }
    };

    roomButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roomButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.getAttribute('data-room');
        buildRoom(type);

        // Update UI details
        const info = roomDetailsMap[type];
        if (info) {
          roomName.textContent = info.title;
          roomDimensions.textContent = info.dims;
          roomFeatures.innerHTML = info.features.map(f => `<span>${f}</span>`).join('');
        }
      });
    });

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // 5. GALLERY LIGHTBOX MODAL
  const modal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');
  const galleryCards = document.querySelectorAll('.gallery-card');

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      modal.style.display = 'flex';
      modalImg.src = imgSrc;
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // 6. FORM SUBMISSION
  const hostelForm = document.getElementById('hostelForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');

  if (hostelForm) {
    hostelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hostelForm.style.display = 'none';
      formSuccessAlert.style.display = 'flex';
    });
  }
});
