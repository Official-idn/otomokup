<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hK-EZEUp0Ve1hz4Mv0E5qJSB5_sUIW4v

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### GitHub Pages Deployment

The application will automatically deploy to GitHub Pages when you push to the `main` branch or create a pull request.

#### Workflow Features:
- **Automatic triggers**: Deploys on push to `main` branch and pull requests
- **Build process**: Uses Node.js 18, installs dependencies, and builds the application
- **SPA routing support**: Includes 404.html and redirect scripts for client-side routing
- **Asset optimization**: Configured for optimal loading of images and static assets

#### Manual Deployment (Alternative):
If you prefer manual deployment, you can use:
```bash
npm run deploy
```

#### GitHub Pages Configuration:
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically handle the deployment

#### Troubleshooting:
- If you see a blank page after deployment, check the browser console for routing issues
- Ensure all asset paths are relative (starting with `/`) for GitHub Pages compatibility
- The SPA redirect script handles client-side routing automatically

The deployed application will be available at: `https://[username].github.io/[repository-name]/`
