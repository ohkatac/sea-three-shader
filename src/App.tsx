import { useEffect, useRef, useState } from 'react'
import './App.css'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as lil from "lil-gui";
import skyBg from "./textures/sky.jpg"

import vertexShader from './glsl/main.vert?raw'
import fragmentShader from './glsl/main.frag?raw'

const gui = new lil.GUI({ width: 300 })

// color
const colorObject = {
  depthColor: "#2d81ae",
  surfaceColor: "#66c1f9",
}

// 必須の３要素を追加
const sizes = {
  width: window.innerWidth, height: window.innerHeight
}

const scene = new THREE.Scene();
// texture
const textureLoader = new THREE.TextureLoader()
const skyTexture = textureLoader.load(skyBg)
scene.background = skyTexture

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uWaveLength: { value: 0.38 },
    uFrequency: {value: new THREE.Vector2(2.5, 2.5) },
    uTime: { value: 0.0 },
    uWaveSpeed: {value: 0.75},
    uDepthColor: {value: new THREE.Color(colorObject.depthColor)},
    uSurfaceColor: {value: new THREE.Color(colorObject.surfaceColor)},
    uColorOffset: {value: 0.2},
    uColorMultiplier: {value: 9.0},
    uSmallWaveElevation: { value: 0.15 },
    uSmallWaveFrequency: { value: 3.0 },
    uSmallWaveSpeed: { value: 0.2 },
  }
})

// debug
gui.add(material.uniforms.uWaveLength, "value")
  .min(0).max(1).step(0.01).name("uWaveLength")
gui.add(material.uniforms.uFrequency.value, "x")
  .min(0).max(10).step(0.01).name("uFrequencyX")
gui.add(material.uniforms.uFrequency.value, "y")
  .min(0).max(10).step(0.01).name("uFrequencyY")
gui.add(material.uniforms.uWaveSpeed, "value")
  .min(0).max(4).step(0.001).name("uWaveSpeed")

gui.add(material.uniforms.uColorOffset, "value")
  .min(0).max(1).step(0.001).name("uColorOffset")
gui.add(material.uniforms.uColorMultiplier, "value")
  .min(0).max(10).step(0.001).name("uColorMultiplier")

gui.add(material.uniforms.uSmallWaveElevation, "value")
.min(0).max(3).step(0.01).name("uSmallWaveElevation")
gui.add(material.uniforms.uSmallWaveFrequency, "value")
  .min(0).max(10).step(0.01).name("uSmallWaveFrequency")
gui.add(material.uniforms.uSmallWaveSpeed, "value")
.min(0).max(1).step(0.01).name("uSmallWaveSpeed")
gui.addColor(colorObject, "depthColor").onChange(() => {
  material.uniforms.uDepthColor.value.set(colorObject.depthColor)
})
gui.addColor(colorObject, "surfaceColor").onChange(() => {
  material.uniforms.uSurfaceColor.value.set(colorObject.surfaceColor)
})

gui.show(false)

// Geometry
const geometry = new THREE.PlaneGeometry(8, 8, 128, 128)

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.x = -Math.PI / 2;

scene.add(mesh);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0.23, 0)
scene.add(camera);

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvasElem = canvasRef.current ?? undefined

    if (canvasElem != undefined) {
      // Controls
      const controls = new OrbitControls(camera, canvasElem);
      controls.enableDamping = true;
      // renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasElem,
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(window.devicePixelRatio)

      const clock = new THREE.Clock()
      const animate = () => {
        //時間取得
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime

        // move camera (円周上に周回させる)
        camera.position.x = Math.sin(elapsedTime * 0.17) * 3.0
        camera.position.z = Math.cos(elapsedTime * 0.17) * 3.0

        camera.lookAt(Math.cos(elapsedTime), Math.sin(elapsedTime) * 0.5, Math.sin(elapsedTime))

        // controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
      }
      animate()

      // resize window
      const observer = new ResizeObserver((entries) => {
        sizes.width  = window.innerWidth
        sizes.height = window.innerHeight

        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(window.devicePixelRatio)
      });

      // 要素を監視
      appRef.current && observer.observe(appRef.current);

      // クリーンアップ関数で監視を解く
      return () => {
        observer.disconnect();
      };
    }
  })

  return (
    <div className="App" ref={appRef}>
      <canvas className="webgl" ref={canvasRef}></canvas>
      <header>
        <h3 className='logo'>Shader.com</h3>
        <ul>
          <li><a href="#">HOME</a></li>
          <li><a href="#">BLOG</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </header>

      <main>
        <h1>DIVE INTO DEEP....</h1>
        <p>Three.js の深みへ....</p>
      </main>
    </div>
  )
}

export default App
