import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = fileURLToPath(new URL("../", import.meta.url))
const url = process.env.ASTRO_BACKEND_URL || "http://127.0.0.1:8000"
let response
try {
  response = await fetch(`${url}/api/health`, {
    signal: AbortSignal.timeout(2500),
  })
} catch {}
if (response) {
  const health = await response.json().catch(() => ({}))
  if (
    response.ok &&
    health.status === "ok" &&
    health.engine?.startsWith("antariksha-")
  ) {
    console.log(
      `Antariksha backend is already healthy at ${url}. Reusing the running service.`,
    )
    process.exit(0)
  }
  console.error(
    `A different or unhealthy service is responding at ${url}. Check that process before starting another backend.`,
  )
  process.exit(1)
}
if (process.env.ASTRO_BACKEND_URL) {
  console.error(
    "The configured ASTRO_BACKEND_URL is unreachable. Start that service, then retry.",
  )
  process.exit(1)
}
const python = path.join(
  root,
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python",
)
if (!existsSync(python)) {
  console.error(
    "Python environment missing. Follow backend/README.md to install the backend dependencies.",
  )
  process.exit(1)
}
const child = spawn(
  python,
  ["-m", "uvicorn", "backend.app:app", "--host", "127.0.0.1", "--port", "8000"],
  {
    cwd: root,
    stdio: "inherit",
    shell: false,
    windowsHide: true,
  },
)
child.on("error", (error) => {
  console.error(`Backend startup failed: ${error.message}`)
  process.exitCode = 1
})
child.on("exit", (code) => {
  process.exitCode = code ?? 1
})
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill())
