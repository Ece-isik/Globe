//import './style.css'
//import * as THREE from 'three'
//import gsap from 'gsap'
//import fragmentShader from './shaders/fragment.glsl'
//import vertexShader from './shaders/vertex.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const canvasContainer = document.querySelector('.canvas')
const sizes = {
    width: canvasContainer.offsetWidth,
    height: canvasContainer.offsetHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 15
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const earthUVMap = textureLoader.load(
    'https://1.bp.blogspot.com/-UUXaK5GCj-k/UcsKJRMgkVI/AAAAAAAACfM/sePP_H08JTQ/s1600/1.jpg')

/**
 * Objects
 */
// earth
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial(
        {
            vertexShader: `
            varying vec2 vertexUV;
            varying vec3 vertexNormal;

            void main() 
            {
                vertexUV = uv;
                vertexNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  
            }`,
            fragmentShader: `
            uniform sampler2D globeTexture;
            varying vec2 vertexUV; //[0,0.24]
            varying vec3 vertexNormal;
            
            void main() 
            {
                float intensity = 1.05 - dot(vertexNormal, vec3(0,0,1));
                vec3 atmosphere = vec3(0.3,0.6,1) * pow(intensity, 1.5);
                gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
            }`,
            uniforms:
            {
                globeTexture:
                {
                    value: earthUVMap
                }
            }
        }
    )
)

// atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial(
        {
            vertexShader: `
            varying vec3 vertexNormal;

            void main() 
            {
                vertexNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  
            }`,
            fragmentShader: `
            varying vec3 vertexNormal; 

            void main() 
            {
                float intensity = pow(0.6 - dot(vertexNormal, vec3(0,0,1.0)),2.0);
                gl_FragColor = vec4(0.3,0.6,1.0,1.0) * intensity;
            }`,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        }
    )
)
atmosphere.scale.set(1.2,1.2,1.2)

const group = new THREE.Group()
group.add(sphere, atmosphere)
scene.add(group)

/**
 * Stars
 */

const material = new THREE.PointsMaterial({
    color: 0xffffff,
    sizeAttenuation: false,
    size: 3,       // in pixels
    
});
    const geometry = new THREE.SphereGeometry(7, 24, 18);

    const points = new THREE.Points(geometry, material);
    scene.add(points);

/**
 * Mouse
 */
const mouse = {}
window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    sphere.rotation.y = elapsedTime * 0.1

    if(mouse.x || mouse.y)
    {
    gsap.to(group.rotation, {y: mouse.x * 0.4, duration: 2})
    gsap.to(group.rotation, {x: mouse.y * 0.2, duration: 2})
    }
    
    points.position.z = Math.sin(elapsedTime * 0.5) * 2;
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
