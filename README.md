# 🕊️ Pigeon World: 3D Interactive Simulator

Welcome to Pigeon World, an interactive 3D playground where you can hang out with a flock of curious, stylized pigeons. Built with React 19, Three.js, TypeScript, and Tailwind CSS, this project lets you toss breadcrumbs, watch birds flutter through the sky, and explore three distinct environments from day to night.

---

## What You Can Do

### Watch and Interact with the Flock
* **Natural flocking**: Birds stay together, give each other space, and navigate around their environment smoothly.
* **Realistic bird habits**: Pigeons spend their time wandering the grass, pecking for food, resting, and dashing toward freshly tossed seeds.
* **Obstacle navigation and perching**: Pigeons steer around trees, boulders, and buildings. In the Roman village, they will even hop up onto the fountain rim and stone benches to rest.
* **Startle reaction**: Click near a pigeon to watch it take off in a flurry of wings, or scatter the whole flock at once.

### Explore 3 Different Worlds
* **Forest Meadow**: Rolling green hills dotted with pine trees, oaks, and wildflowers.
* **Sunny Beach**: Warm sand, palm trees, gentle ocean waves, and seaside rocks.
* **Ancient Rome**: A sunny stone plaza with classic columns, benches, and a central water fountain.

### Shift the Time of Day
* **Presets**: Quickly switch between Dawn, Noon, Sunset, and Twilight.
* **Smooth slider**: Drag the time slider to smoothly dial in the exact lighting, sky colors, and atmospheric mood you like.

### Two Ways to View the Scene
* **Free orbit**: Click and drag across the ground to spin around the scene, pan, and zoom without disturbing the birds.
* **Birdie Cam**: Click Follow to lock your camera onto a pigeon and fly along with it in third-person view. You can still orbit your view all the way around the bird while it flies.

### Toss Seeds
* Double-click the ground or hit the Feed button to throw down golden seeds.
* Seeds bounce on the terrain, and nearby pigeons will hurry over to peck them up.

### Synthesized Sound Effects
* Procedural audio creates cozy coos, wing flaps when pigeons take flight, and clicks when seeds scatter on the ground.
* A quick mute button lets you turn sound on or off anytime.

### Retro UI
* A pastel layout inspired by classic desktop windows, complete with custom icons, clean buttons, and a handy in-game guide.
* Works cleanly on phones, tablets, and desktop screens.

---

## Controls and Shortcuts

| Action | How to do it | What happens |
| :--- | :--- | :--- |
| **Look around** | Click and drag (or touch swipe) | Rotates and moves the camera around the world |
| **Startle birds** | Single-click the ground | Sends nearby pigeons flying into the air |
| **Toss seeds** | Double-click the ground, or tap `Feed` | Drops seeds that attract hungry pigeons |
| **Scatter flock** | Tap `Scatter` | Sends every bird flying into the sky |
| **Birdie Cam** | Tap `Follow` | Follows a pigeon in third-person view |
| **Flock size** | Use `+` and `-`, or type a number | Change the number of pigeons (1 to 150) |
| **Change scenery** | Tap Forest, Beach, or Rome | Switches the current 3D world |
| **Adjust lighting** | Drag the time slider, or tap the time icon | Changes the time of day and sun position |
| **Reset camera** | Tap the circular arrow icon | Returns the camera back to its home view |
| **Toggle audio** | Tap the speaker icon | Mutes or unmutes the sound effects |
| **Open guide** | Tap the book icon | Opens the quick in-game handbook |

---

## Built With

* **React 19** and **TypeScript** for reactive state and component structure
* **Three.js** for 3D graphics, lighting, and rendering
* **Tailwind CSS v4** for clean responsive styling
* **Web Audio API** for real-time procedural sound effects
* **Vite** for fast local development and production bundling

---

## Project Structure

```text
├── index.html                   # HTML entry point with custom typography
├── package.json                 # Project scripts and dependencies
├── metadata.json                # Project details and permissions
├── src/
│   ├── App.tsx                  # Main app component that ties everything together
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Tailwind imports and custom retro styles
│   ├── types.ts                 # TypeScript types and definitions
│   ├── audio/
│   │   └── soundManager.ts      # Web Audio procedural sound generator
│   ├── components/
│   │   ├── Header.tsx           # Floating pastel control bar
│   │   ├── InfoModal.tsx        # Quick handbook modal
│   │   └── CuteIcons.tsx        # Handcrafted SVG icons
│   └── scene/
│       ├── sceneManager.ts      # Three.js scene setup, animation loop, and controls
│       ├── pigeon.ts            # Pigeon 3D model, wing flapping, and flocking AI
│       ├── environment.ts       # Sky dome, directional lighting, and fog
│       ├── obstacles.ts         # Props like trees, rocks, fountains, and buildings
│       ├── terrain.ts           # Procedural ground meshes
│       └── feedManager.ts       # Seed physics and eating logic
```

---

## Getting Started

### Requirements
* Node.js (version 18 or newer)
* npm or bun

### Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Open your browser and visit:
```text
http://localhost:3000
```

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the build:
```bash
npm run preview
```

To run type checks:
```bash
npm run lint
```

---

## License

This project is licensed under the Apache-2.0 License.
