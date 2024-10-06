// Настройка сцены, камеры и рендера
const container = document.getElementById('solarSystemContainer');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

let daysDelta = 0;

// Создание сферы
const radius = 5000; // радиус сферы
const widthSegments = 32;
const heightSegments = 32;
const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

// Текстура звёздного неба
const textureLoader = new THREE.TextureLoader();
const sphereMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load('media/textures/bkg2.jpg'),
  side: THREE.BackSide // обращаем нормали внутрь
});

// Создание сферы с текстурой
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Освещение в центре, как Солнце
const light = new THREE.PointLight(0xffffff, 2, 10000);
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
            object.name = item.name;  // Сохраняем имя объекта для отображения
            object.diameter = item.diameter
            object.H = item.absolute_magnitude_param
            object.G = item.magnitude_slope_param
            object.GM = item.standard_gravitational_param
            object.year = item.year
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
    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

    // Используем raycaster для определения пересечения с объектами
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);  // 'true' позволяет пересекаться с дочерними объектами

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log(clickedObject);
        if (!clickedObject.parent.name) {
            return;
        }

        // Приближаем камеру к объекту
        const distance = 10;  // Расстояние от объекта до камеры
        const direction = new THREE.Vector3();
        console.log(camera.position)
        direction.subVectors(camera.position, clickedObject.parent.position).normalize();  // Вычисляем направление от объекта к камере
        const targetPosition = clickedObject.parent.position.clone().add(direction.multiplyScalar(distance));  // Вычисляем новую позицию камеры

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
        // Центрируем управление на выбранном объекте и устанавливаем направление камеры
        controls.target.copy(clickedObject.parent.position);  // Центрируем controls на выбранный объект
        controls.update();  // Обновляем controls

        // Обновляем направление камеры
        camera.lookAt(clickedObject.parent.position);
        // Отображаем информацию об объекте
        document.getElementById('objectInfo').innerHTML = `
        Object: ${clickedObject.parent.name}<br>
        Diameter: ${clickedObject.parent.diameter}<br>
        Absolute magnitude param: ${clickedObject.parent.H}<br>
        Magnitude slope param: ${clickedObject.parent.G}<br>
        Standard gravitational param: ${clickedObject.parent.GM}<br>
        `;
    }
});

// Кнопка для отдаления камеры
function showZoomOutButton() {
    const zoomOutButton = document.getElementById('zoomOutButton');
    zoomOutButton.style.display = 'block';
}

// Обработка отдаления камеры
document.getElementById('zoomOutButton').addEventListener('click', () => {
    controls.target.copy(new THREE.Vector3(0, 0, 0));
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



window.addEventListener('resize', function () {
    const container = document.getElementById('solarSystemContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});


function updatePlanetPositions() {
    // Проходим по всем объектам сцены
    scene.traverse(function (object) {
        // Проверяем, является ли объект моделью планеты (объекты с именами планет)
        if (object.isMesh && object.parent.name && object.parent.name !== "Sun") {
            // Делаем запрос для получения координат этой планеты
            fetch(`/api/get-current-coords/${object.parent.name}?days=${daysDelta}`)
                .then(response => response.json())
                .then(data => {
                    if (data.coordinates) {
                        // Обновляем позицию модели с новыми координатами
                        const { x, y, z } = data.coordinates;
                        object.parent.position.set(x, y, z);
                    }
                })
                .catch(error => console.error(`Ошибка обновления координат для ${object.parent.name}:`, error));
        }
    });
}

// Запуск функции обновления через определенные интервалы времени
setInterval(updatePlanetPositions, 5000);



const timeSlider = document.getElementById('timeSlider');
const daysLabel = document.getElementById('daysLabel');
daysLabel.textContent = new Date().toISOString().split('T')[0];

function updateDateLabel() {
        const currentDate = new Date();  // Текущая дата
        const futureDate = new Date(currentDate.getTime());  // Копируем текущую дату

        futureDate.setDate(currentDate.getDate() + parseInt(daysDelta));  // Добавляем кол-во дней

        // Форматируем дату как YYYY-MM-DD
        const formattedDate = futureDate.toISOString().split('T')[0];


        daysLabel.textContent = formattedDate;  // Отображаем дату в формате YYYY-MM-DD
    }
timeSlider.addEventListener('input', function() {
        daysDelta = this.value;  // Получаем значение ползунка
        // daysLabel.textContent = daysDelta;  // Отображаем текущий сдвиг времени
        updateDateLabel();
        updatePlanetPositions();  // Обновляем позиции планет
    });

function getAndDrawOrbit() {

    scene.traverse(function (object) {
        // console.log(object);
        // Проверяем, является ли объект моделью планеты (объекты с именами планет)
        if (object.isMesh && object.parent.name && object.parent.name !== "Sun") {
            fetch(`api/get-planet-orbit/${object.parent.name}?year=${object.parent.year}`)
        .then(response => response.json())
        .then(data => {
            const orbitPositions = data.positions.map(pos => new THREE.Vector3(
                pos.x,  // Масштабирование координат
                pos.y,
                pos.z,
            ));

            // Геометрия орбиты
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPositions);

            // Материал линии орбиты
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

            // Создание линии орбиты
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

            // Добавляем орбиту на сцену
            scene.add(orbitLine);
        })
        .catch(error => console.error(`Ошибка получения орбиты для ${object.parent.name}:`, error));
        }
    });
}

// Пример вызова для планеты "earth"
setTimeout(getAndDrawOrbit, 5000);

function createLabel(text, position) {

    // Создание Canvas для текста
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Настройка шрифта и размера
    const fontSize = 32; // Размер шрифта, уменьшите до 48px для лучшей пропорции
    context.font = `${fontSize}px Arial`;
    const textWidth = text.length * fontSize*0.8 // Ширина текста
    const textHeight = fontSize*1.5; // Высота текста

    // Установка размера Canvas в зависимости от текста
    // canvas.width = textWidth;
    // canvas.height = textHeight;

    // Настройка фона и цвета текста
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';  // Полупрозрачный черный фон
    context.fillRect(0, 0, textWidth, textHeight); // Фон
    context.fillStyle = 'white';  // Цвет текста
    context.fillText(text, 0, textHeight * 0.8);  // Положение текста в canvas

    // Создание текстуры для спрайта
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;  // Обновляем текстуру

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false }); // Используем текстуру
    const sprite = new THREE.Sprite(spriteMaterial);

    // Установка размера спрайта
    const scaleFactor = 0.1; // Множитель для размера спрайта, можно увеличить, чтобы увеличить размер спрайта
    sprite.scale.set(textWidth * scaleFactor, textHeight * scaleFactor, 1); // Установка размера спрайта
    sprite.position.copy(position);  // Установка позиции спрайта

    return sprite;
}

function addLabelsToModels() {
    scene.traverse((object) => {
        console.log(object)
        if (object.parent && object.parent.name) {
            const label = createLabel(object.parent.name, object.parent.position.clone().add(new THREE.Vector3(0, 2, 0)));  // Поднимаем текст выше модели
            object.parent.userData.label = label
            scene.add(label);
        }
    });
}

setTimeout(addLabelsToModels, 5000);

function updateLabels() {
    scene.traverse((object) => {
        if (object.parent && object.parent.name) {
            const label = object.parent.userData.label;  // Предполагаем, что метка хранится в userData
            if (label) {
                label.position.copy(object.parent.position.clone().add(new THREE.Vector3(0, 2, 0)));  // Обновляем позицию метки
            }
        }
    });
}

// Анимация сцены
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateLabels()
    renderer.render(scene, camera);
}

animate();