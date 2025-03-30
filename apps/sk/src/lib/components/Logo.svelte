<script lang="ts">
type AnswerStatus = "neutral" | "correct" | "incorrect";

let { isLoading = false, answerStatus = "neutral" as AnswerStatus } = $props();

// Track mouse position
let mouseX = $state(0);
let mouseY = $state(0);

// Container for reference position
let container: HTMLDivElement;

// Movement limits and smoothing
const movementLimit = 5;
const transitionDuration = "0.3s";

// Smoothing function for more natural movement
function smoothValue(value: number): number {
    // Cubic easing function - smoother than linear
    return value * value * value;
}

// Handle global mouse movement
function handleGlobalMouseMove(event: MouseEvent) {
    if (isLoading || !container) return;

    // Get container dimensions
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate normalized position (-1 to 1)
    const rawX = (event.clientX - centerX) / (rect.width / 2);
    const rawY = (event.clientY - centerY) / (rect.height / 2);

    // Clamp values between -1 and 1
    const clampedX = Math.max(-1, Math.min(1, rawX));
    const clampedY = Math.max(-1, Math.min(1, rawY));

    // Apply smoothing
    mouseX = smoothValue(clampedX);
    mouseY = smoothValue(clampedY);
}

// Set up global mouse move listener
$effect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
});

// Animation classes based on answer status
let containerClass = $derived(
    answerStatus === "correct"
        ? "animate-success"
        : answerStatus === "incorrect"
          ? "animate-failure"
          : "",
);

// Eye shapes based on answer status
let eyePathLeft = $derived(
    answerStatus === "correct"
        ? // Happy eye (upward arc)
          "M32.4627 115.093 A18.1439 18.1439 0 0 0 68.7505 115.093"
        : answerStatus === "incorrect"
          ? // Sad eye (downward arc)
            "M32.4627 115.093 A18.1439 18.1439 0 0 1 68.7505 115.093"
          : "",
);

let eyePathRight = $derived(
    answerStatus === "correct"
        ? // Happy eye (upward arc)
          "M89.3796 113.872 A13.7894 13.7894 0 0 0 116.9584 113.872"
        : answerStatus === "incorrect"
          ? // Sad eye (downward arc)
            "M89.3796 113.872 A13.7894 13.7894 0 0 1 116.9584 113.872"
          : "",
);

// Eye colors based on answer status
let eyeColor = $derived(
    answerStatus === "correct"
        ? "#FFD700"
        : // Brighter gold
          answerStatus === "incorrect"
          ? "#E6B800"
          : // Darker gold
            "#FBBF24", // Default color
);

// Calculate styles with transitions
// Head moves slightly
let headStyle = $derived(
    `transform: translate(${mouseX * 2}px, ${mouseY * 2}px); transition: transform ${transitionDuration} ease-out;`,
);

// Eyes move more than the head
let leftEyeStyle = $derived(
    `transform: translate(${mouseX * movementLimit}px, ${mouseY * movementLimit}px); transition: transform ${transitionDuration} ease-out;`,
);
let rightEyeStyle = $derived(
    `transform: translate(${mouseX * movementLimit}px, ${mouseY * movementLimit}px); transition: transform ${transitionDuration} ease-out;`,
);

// Antenna rotates based on mouse position
let antennaStyle = $derived(
    `transform: rotate(${mouseX * 3}deg); transition: transform ${transitionDuration} ease-out;`,
);

// Compute glow classes
let glowClass = $derived(
    answerStatus === "correct"
        ? "glow-success"
        : answerStatus === "incorrect"
          ? "glow-failure"
          : "",
);
</script>

<style>
  .animate-failure {
    animation: success-bounce 0.5s ease-in-out;
  }

  .animate-success {
    animation: failure-shake 0.5s ease-in-out;
  }

  @keyframes success-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes failure-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .glow-success {
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.7));
  }
  
  .glow-failure {
    filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.7));
  }
  
  .speech-bubble {
    position: absolute;
    padding: 8px 12px;
    border-radius: 16px;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-weight: bold;
    font-size: 14px;
    animation: fade-in-out 2s ease-in-out;
    opacity: 0;
  }
  
  .speech-bubble-correct {
    top: 20px;
    right: -20px;
    background-color: #f0fdf4; /* Light green */
    border: 2px solid #10b981; /* Green */
    color: #10b981;
  }
  
  .speech-bubble-incorrect {
    top: 20px;
    left: -20px;
    background-color: #fef2f2; /* Light red */
    border: 2px solid #ef4444; /* Red */
    color: #ef4444;
  }
  
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  @media (max-width: 768px) {
    svg {
      width: 78px;
      height: 99ox;
    }
  }
</style>

<div bind:this={container} class="relative {containerClass}">
  {#if answerStatus === 'correct'}
    <div class="speech-bubble speech-bubble-correct">
      Darn...
    </div>
  {/if}
  
  {#if answerStatus === 'incorrect'}
    <div class="speech-bubble speech-bubble-incorrect">
      Tricked you!
    </div>
  {/if}
{#if isLoading}
  <svg
    class="animate-bounce"
    width="156"
    height="197"
    viewBox="0 0 156 197"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="9.30273"
      y="162.414"
      width="128.367"
      height="26.4285"
      rx="6"
      transform="rotate(3.41513 9.30273 162.414)"
      fill="#242424"
    />
    <rect
      x="8.11237"
      y="59.6416"
      width="148.055"
      height="92.897"
      rx="6"
      transform="rotate(5.00983 8.11237 59.6416)"
      fill="#242424"
    />
    <circle
      cx="50.6066"
      cy="115.093"
      r="18.1439"
      transform="rotate(5.00983 50.6066 115.093)"
      fill="#FBBF24"
    />
    <circle
      cx="103.169"
      cy="113.872"
      r="13.7894"
      transform="rotate(5.00983 103.169 113.872)"
      fill="#FBBF24"
    />
    <path
      d="M75.5946 55.3576L66.3154 25.4659L40.1014 27.1591M87.4034 56.3928L93.1414 23.2562L113.335 6.21104"
      stroke="#242424"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{:else}
  <svg
    width="156"
    height="197"
    viewBox="0 0 156 197"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Head with slight movement -->
    <g style={headStyle}>
      <rect
        x="9.30273"
        y="162.414"
        width="128.367"
        height="26.4285"
        rx="6"
        transform="rotate(3.41513 9.30273 162.414)"
        fill="#242424"
      />
      <rect
        x="8.11237"
        y="59.6416"
        width="148.055"
        height="92.897"
        rx="6"
        transform="rotate(5.00983 8.11237 59.6416)"
        fill="#242424"
      />
    </g>
    
    <!-- Eyes with more movement -->
    {#if answerStatus === 'neutral'}
      <!-- Regular circular eyes -->
      <circle
        cx="50.6066"
        cy="115.093"
        r="18.1439"
        transform="rotate(5.00983 50.6066 115.093)"
        fill={eyeColor}
        style={leftEyeStyle}
        class={glowClass}
      />
      <circle
        cx="103.169"
        cy="113.872"
        r="13.7894"
        transform="rotate(5.00983 103.169 113.872)"
        fill={eyeColor}
        style={rightEyeStyle}
        class={glowClass}
      />
    {:else}
      <!-- Emotional eyes (arcs) -->
      <path
        d={eyePathLeft}
        stroke={eyeColor}
        stroke-width="8"
        fill="none"
        style={leftEyeStyle}
        class={glowClass}
      />
      <path
        d={eyePathRight}
        stroke={eyeColor}
        stroke-width="6"
        fill="none"
        style={rightEyeStyle}
        class={glowClass}
      />
    {/if}
    
    <!-- Antenna with rotation -->
    <g style={antennaStyle} transform-origin="80px 56px">
      <path
        d="M75.5946 55.3576L66.3154 25.4659L40.1014 27.1591M87.4034 56.3928L93.1414 23.2562L113.335 6.21104"
        stroke="#242424"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
{/if}
</div>
