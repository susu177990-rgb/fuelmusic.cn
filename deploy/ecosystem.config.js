module.exports = {
  apps: [
    {
      name: "fuelmusic",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production" }
    }
  ]
}