# Madleena | مادلينا – الجرابة أوتليت

A premium fashion store website with bilingual (Arabic/English) support, SEO optimization, and structured data markup.

## Features

✅ Bilingual support (Arabic `dir="rtl"` + English)  
✅ Comprehensive SEO meta tags & structured data  
✅ Responsive design (mobile-optimized)  
✅ Smooth scroll animations  
✅ Contact form  
✅ Geo-targeting for Libya/MENA  
✅ robots.txt & sitemap.xml  
✅ OpenGraph & Twitter Card support  

## File Structure

```
.
├── index.html       # Main HTML file with SEO tags
├── style.css        # Responsive styling
├── script.js        # Scroll animations & form handling
├── robots.txt       # Search engine directives
├── sitemap.xml      # SEO sitemap
├── package.json     # Project metadata
├── vercel.json      # Vercel deployment config
└── .gitignore       # Git exclusions
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/madleena.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the static site
   - Click "Deploy" ✅

### Local Testing

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then visit `http://localhost:8000` (or 3000 with http-server)

## Important Notes

⚠️ **Missing Assets** — Add your images & video to an `assets/` folder:
```
assets/
├── video.mp4       # Hero video
├── p1.jpg          # Product 1
├── p2.jpg          # Product 2
├── p3.jpg          # Product 3
├── p4.jpg          # Product 4
├── logo.png        # Brand logo
├── og-image.jpg    # Social media image
└── store.jpg       # Store photo
```

🔗 **Update URLs** — Replace all `https://www.madleena.com` with your actual domain in:
- `index.html` (meta tags, canonical, og:url)
- `sitemap.xml`
- `robots.txt`

📧 **Contact Form** — Currently shows an alert. To receive emails:
- Use [Formspree](https://formspree.io) (free)
- Or integrate with [Netlify Forms](https://www.netlify.com/products/forms/)

## SEO Checklist

- ✅ Meta tags (title, description, keywords)
- ✅ Structured data (Schema.org: Organization, LocalBusiness, FAQ)
- ✅ robots.txt & sitemap.xml
- ✅ OpenGraph & Twitter Card
- ✅ Hreflang tags (language targeting)
- ✅ Geo-targeting for Libya
- ✅ Mobile-responsive design
- ✅ Semantic HTML (`<header>`, `<nav>`, `<section>`, etc.)

## Technologies

- HTML5
- CSS3 (Grid, Flexbox)
- Vanilla JavaScript
- Schema.org structured data
- Vercel static hosting

## License

© 2025 Madleena مادلينا. All rights reserved.
