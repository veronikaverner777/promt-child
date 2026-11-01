import type { ProjectId } from "../data";
export function ProjectArt({ id }: { id: ProjectId }) {
  if (id === "case")
    return (
      <svg
        viewBox="0 0 480 290"
        role="img"
        aria-label="Золотой кейс с коллекционными предметами"
      >
        <defs>
          <radialGradient id="cb">
            <stop stopColor="#788b34" />
            <stop offset="1" stopColor="#253222" />
          </radialGradient>
          <linearGradient id="gold" x2=".7" y2="1">
            <stop stopColor="#fff1a1" />
            <stop offset=".5" stopColor="#d7a539" />
            <stop offset="1" stopColor="#73501d" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>
        <path fill="url(#cb)" d="M0 0h480v290H0z" />
        <ellipse
          cx="254"
          cy="240"
          rx="128"
          ry="22"
          fill="#0a1207"
          opacity=".6"
        />
        <path
          d="m60 40 370 210M65 250 410 35M244 10v270"
          stroke="#e0fa83"
          opacity=".08"
        />
        <circle
          cx="245"
          cy="150"
          r="95"
          fill="#b1db59"
          opacity=".22"
          filter="url(#glow)"
        />
        <g transform="rotate(-12 240 150)">
          <path d="m125 113 189-17 49 32-192 20z" fill="#f5d477" />
          <path d="m125 113 46 35 6 100-47-37z" fill="#9f7029" />
          <path d="m171 148 192-20-8 100-178 20z" fill="url(#gold)" />
          <path d="m136 122 180-17 31 20-174 17z" fill="#5f5128" />
          <path
            d="m167 99 1-25 82-10 20 14v25"
            fill="none"
            stroke="#e3bd5b"
            strokeWidth="12"
          />
          <path
            d="m191 148-1 94m136-109-7 99"
            stroke="#efca69"
            strokeWidth="9"
          />
          <path d="m173 164 186-20" stroke="#75532b" strokeWidth="3" />
          <path d="m242 164 51-5-2 45-47 6z" fill="#493d22" />
          <path
            d="m266 171 6 12 13 1-10 9 2 13-12-7-11 8 2-14-11-8 14-2z"
            fill="#fbdf8b"
          />
          <path d="m132 182 36 27" stroke="#684f27" strokeWidth="4" />
        </g>
        <g fill="#eafb9f">
          <path d="m91 82 3 9 10 3-10 3-3 10-3-10-10-3 10-3z" />
          <path d="m380 188 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
          <circle cx="349" cy="58" r="3" />
          <circle cx="103" cy="220" r="2" />
        </g>
      </svg>
    );
  if (id === "car")
    return (
      <svg
        viewBox="0 0 480 290"
        role="img"
        aria-label="Фиолетовый спортивный автомобиль"
      >
        <defs>
          <radialGradient id="carg">
            <stop stopColor="#695290" />
            <stop offset="1" stopColor="#28213d" />
          </radialGradient>
          <linearGradient id="bodyg" x2=".4" y2="1">
            <stop stopColor="#d2b2ff" />
            <stop offset=".45" stopColor="#9870d5" />
            <stop offset="1" stopColor="#583287" />
          </linearGradient>
        </defs>
        <path fill="url(#carg)" d="M0 0h480v290H0z" />
        <g stroke="#d2b5ff" opacity=".1">
          <path d="m0 270 240-140 240 140M0 220l240-90 240 90M0 180l240-50 240 50M80 290l160-160 160 160M160 290l80-160 80 160" />
        </g>
        <ellipse
          cx="251"
          cy="223"
          rx="175"
          ry="27"
          fill="#160e22"
          opacity=".7"
        />
        <path
          d="m62 163 62-20 61-48 114-5 62 46 49 18 11 42-31 21-240-9-87-24z"
          fill="url(#bodyg)"
        />
        <path d="m142 141 51-40 97-3 49 40z" fill="#292c42" />
        <path d="m209 102-16 36 126-1-34-34z" fill="#3c405c" />
        <path d="m189 105-15 34-22 1z" fill="#c7a1f7" />
        <path
          d="m60 164 104 7 93-16 103-17m-196 32 1 20 91 15 245-13"
          fill="none"
          stroke="#e3c7ff"
          strokeWidth="2"
          opacity=".5"
        />
        <path d="m170 173 192-25-5 37-181 16z" fill="#7147a5" />
        <path d="m205 162 1 28m105-41-2 29" stroke="#4c306d" />
        <path d="m219 166 18-2m86-16 14-2" stroke="#e6c9ff" strokeWidth="3" />
        <g fill="#16131f" stroke="#5c4c70" strokeWidth="3">
          <ellipse cx="142" cy="201" rx="27" ry="35" />
          <ellipse cx="365" cy="191" rx="26" ry="35" />
        </g>
        <g fill="#716b83" stroke="#c0b8d1" strokeWidth="4">
          <ellipse cx="142" cy="201" rx="15" ry="23" />
          <ellipse cx="365" cy="191" rx="15" ry="23" />
        </g>
        <path d="m63 171 40 9 1 9-38-8m334-25 19 7 2 9-24-5" fill="#eaf5ff" />
        <path d="m72 194 35 8m75 8 141-7" stroke="#1d132a" strokeWidth="5" />
        <path d="m356 128 18 2 7 9-20 1" fill="#ba8ff4" />
        <circle
          cx="388"
          cy="63"
          r="28"
          fill="none"
          stroke="#c3a6ec"
          opacity=".2"
        />
        <path
          d="m378 64 8 8 15-16"
          stroke="#d3b4ff"
          fill="none"
          strokeWidth="3"
        />
      </svg>
    );
  if (id === "market")
    return (
      <svg
        viewBox="0 0 480 290"
        role="img"
        aria-label="Мини-магазин с наушниками и товарами"
      >
        <defs>
          <linearGradient id="mg" x2="1" y2="1">
            <stop stopColor="#5c3831" />
            <stop offset="1" stopColor="#2d2527" />
          </linearGradient>
        </defs>
        <path fill="url(#mg)" d="M0 0h480v290H0z" />
        <circle
          cx="240"
          cy="150"
          r="119"
          fill="none"
          stroke="#d99b7d"
          opacity=".1"
        />
        <g transform="rotate(-9 240 150)">
          <rect
            x="100"
            y="48"
            width="284"
            height="207"
            rx="13"
            fill="#ede8e4"
          />
          <path
            d="M113 48h258q13 0 13 13v24H100V61q0-13 13-13"
            fill="#fcfaf6"
          />
          <circle cx="116" cy="66" r="3" fill="#fb9276" />
          <circle cx="128" cy="66" r="3" fill="#edc566" />
          <circle cx="140" cy="66" r="3" fill="#9dba91" />
          <rect x="173" y="60" width="158" height="13" rx="5" fill="#e8e3df" />
          <rect x="116" y="98" width="115" height="127" rx="7" fill="#dfbca5" />
          <rect x="244" y="98" width="122" height="56" rx="7" fill="#d2d5c4" />
          <rect x="244" y="164" width="122" height="61" rx="7" fill="#d5c9dc" />
          <path
            d="M143 165v-24a31 31 0 0 1 62 0v24"
            fill="none"
            stroke="#79564b"
            strokeWidth="12"
          />
          <rect x="134" y="147" width="19" height="39" rx="8" fill="#483b38" />
          <rect x="195" y="147" width="19" height="39" rx="8" fill="#483b38" />
          <path
            d="m292 108-21 15 11 11 8-6v20h30v-20l8 6 10-11-20-15-12 7z"
            fill="#7f986f"
          />
          <rect x="282" y="176" width="45" height="32" rx="8" fill="#b7a0c5" />
          <circle cx="305" cy="191" r="11" fill="#e4dce9" />
          <path
            d="M126 238h68m53 0h55"
            stroke="#bcb1a9"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
        <g transform="rotate(12 371 213)">
          <rect x="335" y="175" width="75" height="67" rx="15" fill="#e7a77d" />
          <path
            d="m351 193 5 2 4 23h30l4-17h-36m7 24h1m18 0h1"
            fill="none"
            stroke="#593c31"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
        <path d="m73 88 3 9 10 3-10 3-3 10-3-10-10-3 10-3z" fill="#eeb48d" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 480 290"
      role="img"
      aria-label="Уютная комната с зелёным диваном"
    >
      <defs>
        <linearGradient id="rg" x2="1" y2="1">
          <stop stopColor="#644651" />
          <stop offset="1" stopColor="#30272f" />
        </linearGradient>
      </defs>
      <path fill="url(#rg)" d="M0 0h480v290H0z" />
      <path d="m85 99 157-62 151 65v134l-154 47-154-59z" fill="#dab6aa" />
      <path d="m85 99 157-62v145l-157 42z" fill="#e4c4b7" />
      <path d="m242 37 151 65v134l-151-54z" fill="#bc9292" />
      <path d="m85 224 157-42 151 54-154 47z" fill="#c69c86" />
      <g stroke="#a58070" opacity=".55">
        <path d="m111 234 157-43m-126 55 155-45m-122 57 153-46m-117 60 147-49" />
      </g>
      <path d="m110 105 76-29v76l-76 26z" fill="#82696d" />
      <path d="m116 109 64-24v62l-64 22z" fill="#c7d9d8" />
      <path d="M149 97v61m-32-20 63-23" stroke="#f7e3d4" strokeWidth="5" />
      <path d="m268 80 45 18v39l-45-16z" fill="#f5d8bc" />
      <path d="m276 111 10-17 9 17 10 4v11z" fill="#ab817d" />
      <ellipse cx="244" cy="226" rx="87" ry="26" fill="#edc7ba" />
      <path d="m186 167 93-26 66 24-100 30z" fill="#718b6d" />
      <path d="m186 167 59 28v37l-59-28z" fill="#5c755d" />
      <path d="m245 195 100-30v36l-100 31z" fill="#8a9e7b" />
      <path d="m192 163 10-28 88-24 52 20-1 32-96 28z" fill="#a6b092" />
      <path
        d="m207 139 37 13-1 30-42-16zm44 11 36-11 1 29-38 12z"
        fill="#b8c2a3"
      />
      <path d="m293 137 31-9 9 26-35 11z" fill="#dcc3a7" />
      <ellipse cx="202" cy="228" rx="31" ry="13" fill="#f0d5b5" />
      <path d="m177 230-2 26m49-25 3 25" stroke="#896e5b" strokeWidth="5" />
      <path
        d="M358 161v47m-13-42q-24-32 9-26m7 14q25-34 15-10m-18 21q-30-10-16-27"
        fill="#6e8a69"
        stroke="#667f5d"
        strokeWidth="4"
      />
      <path d="m345 196 27 9-5 24-19-6z" fill="#d7bd9f" />
    </svg>
  );
}
export function HeroArt() {
  return (
    <svg viewBox="0 0 520 330" aria-hidden="true">
      <defs>
        <radialGradient id="halo">
          <stop stopColor="#9aa85e" stopOpacity=".2" />
          <stop offset="1" stopColor="#15161b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cube" x2="1" y2="1">
          <stop stopColor="#e0fc9b" />
          <stop offset="1" stopColor="#83b744" />
        </linearGradient>
        <linearGradient id="orb" x2="1" y2="1">
          <stop stopColor="#e9e0ff" />
          <stop offset=".4" stopColor="#b39adc" />
          <stop offset="1" stopColor="#665089" />
        </linearGradient>
        <filter id="shadow">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse cx="280" cy="175" rx="230" ry="155" fill="url(#halo)" />
      <ellipse
        cx="275"
        cy="274"
        rx="117"
        ry="17"
        fill="#000"
        opacity=".4"
        filter="url(#shadow)"
      />
      <g stroke="#7c806c" fill="none" opacity=".26">
        <ellipse
          cx="273"
          cy="172"
          rx="204"
          ry="82"
          transform="rotate(-26 273 172)"
        />
        <ellipse
          cx="273"
          cy="172"
          rx="169"
          ry="119"
          transform="rotate(27 273 172)"
        />
      </g>
      <g className="floating">
        <path d="m220 105 93-36 80 44-90 39z" fill="#dcf5ad" />
        <path d="m220 105 83 47v100l-83-48z" fill="url(#cube)" />
        <path d="m303 152 90-39v100l-90 39z" fill="#78994b" />
        <path
          d="m235 118 54 30v70l-54-30z"
          stroke="#edfbd7"
          opacity=".3"
          fill="none"
        />
        <path d="m333 156 30-13v39l-30 13z" fill="#151d12" opacity=".6" />
        <path
          d="m341 164 7 4 9-14"
          stroke="#dcf5ad"
          strokeWidth="3"
          fill="none"
        />
      </g>
      <g className="floating slow">
        <circle cx="159" cy="219" r="48" fill="url(#orb)" />
        <ellipse
          cx="146"
          cy="200"
          rx="17"
          ry="10"
          fill="#fff"
          opacity=".2"
          transform="rotate(-35 146 200)"
        />
        <path
          d="m141 220 12 8m2-25 6 6m5 17 10-11"
          stroke="#5c4879"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(15 385 64)">
        <rect x="359" y="37" width="55" height="55" rx="16" fill="#bba4e5" />
        <path
          d="m375 57-7 7 7 7m22-14 7 7-7 7m-11-18-4 23"
          fill="none"
          stroke="#413452"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(-12 109 103)">
        <rect
          x="74"
          y="80"
          width="76"
          height="39"
          rx="10"
          fill="#25292a"
          stroke="#45493f"
        />
        <path
          d="m89 99 6 6 11-12"
          stroke="#bfeb83"
          fill="none"
          strokeWidth="3"
        />
        <path d="M115 96h23m-23 8h14" stroke="#6c7662" strokeWidth="3" />
      </g>
      <circle cx="439" cy="203" r="8" fill="#c7f68b" />
      <circle cx="219" cy="41" r="4" fill="#c4a5f0" />
      <path d="m428 117 3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="#c8b0ed" />
      <path d="m82 196 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#cbed9e" />
      <g transform="rotate(-9 367 274)">
        <rect
          x="327"
          y="255"
          width="101"
          height="32"
          rx="9"
          fill="#222720"
          stroke="#424d34"
        />
        <text
          x="341"
          y="276"
          fill="#c4e89b"
          fontSize="13"
          fontFamily="monospace"
        >
          ✦ идея → код
        </text>
      </g>
    </svg>
  );
}
