// Установим сцену, камеру и рендер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('modelContainer').appendChild(renderer.domElement);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Загружаем модель с сервера Django
const loader = new THREE.OBJLoader();
loader.load('api/get-model', function (obj) {
    scene.add(obj);
}, undefined, function (error) {
    console.error(error);
});

// Позиция камеры
camera.position.z = 5;

// Вращение модели мышью
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

document.addEventListener('mousedown', function () {
    isDragging = true;
}, false);

document.addEventListener('mousemove', function (event) {
    if (isDragging) {
        const deltaMove = {
            x: event.offsetX - previousMousePosition.x,
            y: event.offsetY - previousMousePosition.y
        };

        const rotationSpeed = 0.005;
        const model = scene.children[1]; // предполагаем, что модель будет вторым элементом

        model.rotation.y += deltaMove.x * rotationSpeed;
        model.rotation.x += deltaMove.y * rotationSpeed;
    }

    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
    };
}, false);

document.addEventListener('mouseup', function () {
    isDragging = false;
}, false);

// Рендер сцены
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();