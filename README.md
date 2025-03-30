<p align="center">

  <a href="https://github.com/LargeLiarModel/LargeLiarModel">
    <img src=".github/robot_banner.png" alt="cover-image" width="400rem">
  </a>

  <h1 align="center">LargeLiarModel</h1>

</p>

<div align="center">

![GitHub language](https://img.shields.io/github/languages/top/LargeLiarModel/LargeLiarModel?color=FF6663)
![Devpost](https://img.shields.io/badge/devpost-FEB144?link=https://devpost.com/software/large-liar-model)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/LargeLiarModel/LargeLiarModel?color=FAFD7B)
![GitHub repo size](https://img.shields.io/github/repo-size/LargeLiarModel/LargeLiarModel?color=9EE09E)
![GitHub](https://img.shields.io/github/license/LargeLiarModel/LargeLiarModel?color=9EC1CF)
![GitHub last commit](https://img.shields.io/github/last-commit/LargeLiarModel/LargeLiarModel?color=CC99C9)

</div>

---

# Large Liar Model

A game that challenges players to distinguish between real and AI-generated content, teaching critical media literacy skills in the age of artificial intelligence.

## Inspiration

Large Liar Model was born from recognizing one of the most pressing issues of our digital era: the proliferation of AI-generated misinformation. In a world where distinguishing fact from fiction becomes increasingly difficult, we wanted to create an interactive experience that helps people develop the critical thinking skills needed to navigate today's complex information landscape.

## What it does

Large Liar Model is an educational game that tests players' ability to identify whether content is authentic or AI-generated:

- Players choose how many questions they want to answer
- The game presents a random mix of different content types:
  - Images (photographs vs. AI-generated art)
  - News article snippets 
  - Statistics about political candidate contributions
- After completing all questions, players receive a score showing how many AI-generated items they correctly identified
- The experience highlights how convincing AI-generated content can be while teaching players to be more discerning consumers of media

## How we built it

Our technical implementation involved multiple components:

- **Frontend**: Built with Svelte, TypeScript, Vite, Tailwind CSS, and Shaden UI components
- **Backend**: Created using Bun and Hono for efficient API handling
- **Data sources**:
  - Real images: Sourced from Picsum and the Art Institute of Chicago's collections
  - Authentic news articles: Pulled from NewsAPI
  - Political contribution data: Extracted from OpenSecrets
- **AI Content Generation**: Used Google's Gemini to create convincing fake content in real-time
- **Custom API**: Developed our own API to access OpenSecrets data after discovering their official API was discontinued, creating a SQL database from their bulk text files

## Challenges we ran into

Our biggest technical hurdle was implementing a reliable AI content generation pipeline. Generating convincing fake content on-the-fly (rather than using static, pre-generated examples) required significant engineering effort and optimization. Additionally, working around the discontinued OpenSecrets API by building our own database and access layer added unexpected complexity to the project timeline.

## Accomplishments that we're proud of

Simply put - surviving! This project pushed our technical limits and problem-solving abilities. Creating a functional game that effectively teaches about misinformation while being engaging enough that people want to play it represented a significant achievement for our team.

## What we learned

One key technical insight was discovering that pre-generating and serving static assets is generally more efficient and reliable than generating content on-the-fly. This approach would have streamlined our development process significantly. We also gained valuable experience working with AI content generation systems and handling large datasets from sources like OpenSecrets.

## What's next

We have several exciting improvements planned for Large Liar Model:

- Implementing background music to enhance the game experience
- Expanding our AI-generated content types and improving their sophistication
- Adding more educational components to help players understand the specific indicators of AI-generated content
- Creating difficulty levels to challenge more experienced players

---

*Lying is an art form. We just automated it.*