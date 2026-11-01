import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Lightbulb,
  MousePointer2,
  RotateCcw,
  Save,
  Settings2,
} from "lucide-react";
import { useStored } from "../hooks";
import { ProjectArt } from "../components/Artwork";
type Config = {
  color: string;
  wheel: "sport" | "classic" | "future";
  neon: string;
  lights: boolean;
};
const defaultConfig: Config = {
  color: "#a992e5",
  wheel: "sport",
  neon: "#b69cff",
  lights: true,
};
interface StageApi {
  reset: () => void;
  rotate: (direction: number) => void;
  snapshot: () => void;
}
export default function CarStudio() {
  const [config, setConfig] = useStored<Config>("car-config", defaultConfig);
  const [saved, setSaved] = useState(false);
  const [auto, setAuto] = useState(false);
  const stage = useRef<StageApi | null>(null);
  const change = (patch: Partial<Config>) => {
    setConfig((v) => ({ ...v, ...patch }));
    setSaved(false);
  };
  return (
    <div className="car-project">
      <div className="project-toolbar">
        <div className="studio-brand">
          <span>◈</span> CAR STUDIO{" "}
          <span className="pill">Твой стиль. Твоя скорость.</span>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setSaved(true);
          }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}{" "}
          {saved ? "Дизайн сохранён" : "Сохранить дизайн"}
        </button>
      </div>
      <div className="studio-layout">
        <section className="car-stage">
          <div className="stage-title">
            <span className="eyebrow">КОНЦЕПТ № 001</span>
            <h2>
              Nova GT<span>Электрическое воображение.</span>
            </h2>
          </div>
          <CarScene config={config} auto={auto} api={stage} />
          <div className="stage-specs">
            <span>
              100%<small>твой стиль</small>
            </span>
            <span>
              360°<small>свободы</small>
            </span>
            <span>
              ∞<small>возможностей</small>
            </span>
          </div>
          <div className="stage-controls">
            <button
              className="icon-button"
              aria-label="Повернуть автомобиль влево"
              onClick={() => stage.current?.rotate(-1)}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              className="button secondary"
              onClick={() => setAuto((v) => !v)}
            >
              <RotateCcw size={15} />
              {auto ? "Остановить" : "Автовращение"}
            </button>
            <button
              className="icon-button"
              aria-label="Повернуть автомобиль вправо"
              onClick={() => stage.current?.rotate(1)}
            >
              <ChevronRight size={19} />
            </button>
            <button
              className="icon-button"
              aria-label="Сбросить ракурс"
              onClick={() => stage.current?.reset()}
            >
              <Camera size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Скачать изображение автомобиля"
              onClick={() => stage.current?.snapshot()}
            >
              <Download size={18} />
            </button>
          </div>
          <div className="stage-hint">
            <MousePointer2 size={14} /> Перетаскивай, чтобы вращать · Колёсико —
            масштаб
          </div>
        </section>
        <aside className="car-settings">
          <h3>
            <Settings2 size={18} /> Твой конфигуратор
          </h3>
          <div className="config-section">
            <label>
              01 <strong>Цвет кузова</strong>
            </label>
            <div className="color-swatches">
              {[
                "#a992e5",
                "#b5e38b",
                "#f4eee4",
                "#e28572",
                "#76afcf",
                "#353c48",
              ].map((c) => (
                <button
                  key={c}
                  style={{ background: c }}
                  className={config.color === c ? "selected" : ""}
                  aria-label={`Цвет кузова ${c}`}
                  onClick={() => change({ color: c })}
                >
                  {config.color === c && <Check size={16} />}
                </button>
              ))}
            </div>
            <label className="custom-color">
              Свой оттенок
              <input
                aria-label="Свой цвет кузова"
                type="color"
                value={config.color}
                onChange={(e) => change({ color: e.target.value })}
              />
              <span>{config.color.toUpperCase()}</span>
            </label>
          </div>
          <div className="config-section">
            <label>
              02 <strong>Колёсные диски</strong>
            </label>
            <div className="wheel-options">
              {(["sport", "classic", "future"] as const).map((w, i) => (
                <button
                  key={w}
                  className={config.wheel === w ? "selected" : ""}
                  onClick={() => change({ wheel: w })}
                >
                  <span aria-hidden="true" className={`wheel-icon ${w}`}>
                    ✳
                  </span>
                  <small>{["Спорт", "Классика", "Футуризм"][i]}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="config-section">
            <label>
              03 <strong>Атмосферная подсветка</strong>
            </label>
            <div className="color-swatches small-swatches">
              {["#b69cff", "#83e6ff", "#acf377", "#ff85ba", "#ffca75"].map(
                (c) => (
                  <button
                    key={c}
                    style={{ background: c }}
                    className={config.neon === c ? "selected" : ""}
                    aria-label={`Цвет подсветки ${c}`}
                    onClick={() => change({ neon: c })}
                  >
                    {config.neon === c && <Check size={14} />}
                  </button>
                ),
              )}
            </div>
            <label className="toggle-row">
              <span>
                <Lightbulb size={15} /> Включить подсветку
              </span>
              <input
                type="checkbox"
                checked={config.lights}
                onChange={(e) => change({ lights: e.target.checked })}
              />
            </label>
          </div>
          <button
            className="text-button muted"
            onClick={() => {
              setConfig(defaultConfig);
              setSaved(false);
              setAuto(false);
              stage.current?.reset();
            }}
          >
            <RotateCcw size={14} /> Начать заново
          </button>
          <div className="config-note">
            <span className="status-dot" /> Изменения сохраняются автоматически
          </div>
          {saved && (
            <p role="status" className="accent small">
              Твой Nova GT ждёт тебя при следующем визите.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
function CarScene({
  config,
  auto,
  api,
}: {
  config: Config;
  auto: boolean;
  api: React.RefObject<StageApi | null>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const refs = useRef<{
    body: THREE.MeshPhysicalMaterial;
    neon: THREE.MeshStandardMaterial;
    light: THREE.PointLight;
    rimGroups: THREE.Group[];
    controls: OrbitControls;
    invalidate: () => void;
  } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "3D-модель автомобиля Nova GT",
    );
    renderer.domElement.setAttribute("role", "img");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    camera.position.set(6, 3.7, 6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 5;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minPolarAngle = 0.2;
    controls.enablePan = false;
    controls.autoRotateSpeed = 1.4;
    scene.add(new THREE.AmbientLight(0xe0dcf0, 1.4));
    const key = new THREE.DirectionalLight(0xf3ebff, 3);
    key.position.set(3, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.normalBias = 0.03;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x929eff, 1.4);
    fill.position.set(-4, 3, -5);
    scene.add(fill);
    const body = new THREE.MeshPhysicalMaterial({
      color: config.color,
      metalness: 0.5,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x253246,
      metalness: 0.65,
      roughness: 0.14,
      clearcoat: 1,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x11151e,
      roughness: 0.68,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xc5c9d8,
      metalness: 0.85,
      roughness: 0.24,
    });
    const neon = new THREE.MeshStandardMaterial({
      color: config.neon,
      emissive: config.neon,
      emissiveIntensity: 3,
    });
    const mesh = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };
    const box = (
      w: number,
      h: number,
      d: number,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
    ) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
    const silhouette = new THREE.Shape();
    silhouette.moveTo(-2.15, 0.55);
    silhouette.lineTo(-2.15, 0.9);
    silhouette.quadraticCurveTo(-1.9, 1.12, -1.35, 1.12);
    silhouette.lineTo(1.2, 1.12);
    silhouette.quadraticCurveTo(1.85, 1.08, 2.15, 0.9);
    silhouette.lineTo(2.17, 0.57);
    silhouette.closePath();
    mesh(
      new THREE.ExtrudeGeometry(silhouette, {
        depth: 1.65,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.1,
      }),
      body,
      0,
      0,
      -0.825,
    );
    const cabin = new THREE.Shape();
    cabin.moveTo(-1.25, 1.13);
    cabin.lineTo(-0.68, 1.79);
    cabin.quadraticCurveTo(0, 1.94, 0.66, 1.79);
    cabin.lineTo(1.24, 1.13);
    cabin.closePath();
    mesh(
      new THREE.ExtrudeGeometry(cabin, {
        depth: 1.4,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      }),
      body,
      0,
      0,
      -0.7,
    );
    for (const z of [-0.749, 0.749]) {
      const window = new THREE.Shape();
      window.moveTo(-1.06, 1.22);
      window.lineTo(-0.58, 1.71);
      window.lineTo(0.52, 1.71);
      window.lineTo(1.02, 1.22);
      window.closePath();
      mesh(
        new THREE.ShapeGeometry(window),
        new THREE.MeshPhysicalMaterial({
          color: 0x1c293c,
          metalness: 0.7,
          roughness: 0.1,
          side: THREE.DoubleSide,
        }),
        0,
        0,
        z,
      );
      box(0.07, 0.52, 0.025, body, -0.1, 1.47, z * 1.005);
      box(0.2, 0.045, 0.03, chrome, 0.2, 1.1, z * 1.22);
      const mirror = box(0.24, 0.15, 0.22, body, 0.9, 1.2, z * 1.36);
      mirror.rotation.y = 0.15;
    }
    const front = box(0.04, 0.64, 1.3, glass, 0.97, 1.49, 0);
    front.rotation.z = 0.72;
    const rear = box(0.04, 0.62, 1.3, glass, -0.98, 1.46, 0);
    rear.rotation.z = -0.72;
    box(1.03, 0.045, 1.33, body, 0, 1.82, 0);
    box(0.08, 0.2, 1.05, dark, 2.24, 0.68, 0);
    box(0.06, 0.1, 1.45, neon, 2.21, 0.97, 0);
    box(
      0.06,
      0.08,
      1.5,
      new THREE.MeshStandardMaterial({
        color: "#ff6577",
        emissive: "#ff2344",
        emissiveIntensity: 2,
      }),
      -2.24,
      0.96,
      0,
    );
    box(3.5, 0.06, 0.04, neon, 0, 0.43, 0.91);
    box(3.5, 0.06, 0.04, neon, 0, 0.43, -0.91);
    box(4.2, 0.16, 1.76, dark, 0, 0.46, 0);
    const rimGroups: THREE.Group[] = [];
    for (const x of [-1.4, 1.4])
      for (const z of [-0.99, 0.99]) {
        const tire = mesh(
          new THREE.CylinderGeometry(0.51, 0.51, 0.31, 32),
          dark,
          x,
          0.57,
          z,
        );
        tire.rotation.x = Math.PI / 2;
        const hub = mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.325, 32),
          new THREE.MeshStandardMaterial({
            color: "#242630",
            metalness: 0.5,
            roughness: 0.4,
          }),
          x,
          0.57,
          z,
        );
        hub.rotation.x = Math.PI / 2;
        const group = new THREE.Group();
        group.position.set(x, 0.57, z + Math.sign(z) * 0.172);
        scene.add(group);
        rimGroups.push(group);
      }
    const platform = mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.12, 80),
      new THREE.MeshStandardMaterial({
        color: "#141219",
        metalness: 0.25,
        roughness: 0.7,
      }),
      0,
      -0.03,
      0,
    );
    platform.receiveShadow = true;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.43, 0.012, 8, 90),
      neon,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.035;
    scene.add(ring);
    const floor = mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "#101015", roughness: 0.85 }),
      0,
      -0.1,
      0,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = false;
    const light = new THREE.PointLight(config.neon, 8, 6);
    light.position.set(0, 0.35, 0);
    scene.add(light);
    let needsRender = true;
    const invalidate = () => {
      needsRender = true;
    };
    controls.addEventListener("change", invalidate);
    refs.current = { body, neon, light, rimGroups, controls, invalidate };
    const resize = () => {
      const w = host.clientWidth,
        h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      invalidate();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let frame = 0,
      last = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (document.hidden || now - last < 30) return;
      last = now;
      controls.update();
      if (needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    };
    frame = requestAnimationFrame(animate);
    api.current = {
      reset: () => {
        camera.position.set(6, 3.7, 6);
        controls.target.set(0, 0.85, 0);
        controls.update();
      },
      rotate: (d) => {
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), (d * Math.PI) / 6);
        camera.position.copy(controls.target).add(offset);
        controls.update();
      },
      snapshot: () => {
        renderer.render(scene, camera);
        const a = document.createElement("a");
        a.download = "my-nova-gt.png";
        a.href = renderer.domElement.toDataURL("image/png");
        a.click();
      },
    };
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener("change", invalidate);
      controls.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
      refs.current = null;
      api.current = null;
    };
  }, []);
  useEffect(() => {
    const r = refs.current;
    if (!r) return;
    r.body.color.set(config.color);
    r.neon.color.set(config.neon);
    r.neon.emissive.set(config.neon);
    r.neon.emissiveIntensity = config.lights ? 3 : 0;
    r.light.color.set(config.neon);
    r.light.intensity = config.lights ? 8 : 0;
    for (const group of r.rimGroups) {
      for (const child of [...group.children]) {
        group.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      }
      const n =
        config.wheel === "sport" ? 5 : config.wheel === "classic" ? 8 : 3;
      for (let i = 0; i < n; i++) {
        const angle = (i * Math.PI * 2) / n;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(
            config.wheel === "future" ? 0.13 : 0.055,
            0.6,
            0.035,
          ),
          new THREE.MeshStandardMaterial({
            color: config.wheel === "future" ? config.neon : "#d2d4df",
            metalness: 0.8,
            roughness: 0.2,
          }),
        );
        spoke.rotation.z = angle;
        group.add(spoke);
      }
      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: "#444652", metalness: 0.6 }),
      );
      center.rotation.x = Math.PI / 2;
      group.add(center);
    }
    r.invalidate();
  }, [config]);
  useEffect(() => {
    if (refs.current) refs.current.controls.autoRotate = auto;
  }, [auto]);
  return (
    <div className="three-container" ref={container}>
      {error && (
        <div className="webgl-fallback">
          <ProjectArt id="car" />
          <p>
            3D требует WebGL. Включи аппаратное ускорение в браузере и обнови
            страницу.
          </p>
        </div>
      )}
    </div>
  );
}
