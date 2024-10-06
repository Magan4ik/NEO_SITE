// Настройка сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('solarSystemContainer').appendChild(renderer.domElement);

// Освещение в центре, как Солнце
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0);  // Солнце в центре
scene.add(light);

// Позиция камеры
camera.position.z = 50;  // Начальная позиция камеры

// Создаем raycaster для отслеживания кликов
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Флаг для контроля состояния камеры
let isZoomedIn = false;
let originalCameraPosition = camera.position.clone(); // Исходная позиция камеры

// Функция для загрузки моделей
function loadModels(data) {
    const objLoader = new THREE.OBJLoader();

    data.forEach(item => {
        objLoader.load(item.obj_url, function (object) {
            object.userData.name = item.name;  // Сохраняем имя объекта для отображения
            object.scale.set(item.size, item.size, item.size);
            object.position.set(item.position.x, item.position.y, item.position.z);
            scene.add(object);
        }, undefined, function (error) {
            console.error(`Ошибка загрузки ${item.name}:`, error);
        });
    });
}

// Запрос данных моделей с сервера
fetch('/api/get-solar-system')
    .then(response => response.json())
    .then(data => {
        loadModels(data);  // Загружаем модели на сцену
    })
    .catch(error => console.error('Ошибка при получении данных моделей:', error));

// Используем OrbitControls для управления камерой
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;

// Обработка клика на модель
window.addEventListener('click', (event) => {
    if (isZoomedIn) return;  // Блокируем клики, если уже приближены к объекту

    // Определяем координаты клика мыши
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Используем raycaster для определения пересечения с объектами
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);  // 'true' позволяет пересекаться с дочерними объектами

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log(clickedObject);

        // Приближаем камеру к объекту
        const targetPosition = clickedObject.position.clone();
        targetPosition.z += 5;  // Увеличиваем расстояние камеры от объекта

        // Анимация приближения
        gsap.to(camera.position, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            onComplete: () => {
                isZoomedIn = true;
                showZoomOutButton();
            }
        });

        // Отображаем информацию об объекте
        document.getElementById('objectInfo').innerText = `Объект: ${clickedObject.userData.name}`;
    }
});

// Кнопка для отдаления камеры
function showZoomOutButton() {
    const zoomOutButton = document.getElementById('zoomOutButton');
    zoomOutButton.style.display = 'block';
}

// Обработка отдаления камеры
document.getElementById('zoomOutButton').addEventListener('click', () => {
    gsap.to(camera.position, {
        duration: 1,
        x: originalCameraPosition.x,
        y: originalCameraPosition.y,
        z: originalCameraPosition.z,
        onComplete: () => {
            isZoomedIn = false;
            document.getElementById('zoomOutButton').style.display = 'none';
            document.getElementById('objectInfo').innerText = '';  // Очистка информации об объекте
        }
    });
});

// Анимация сцены
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', function () {
    const container = document.getElementById('solarSystemContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
