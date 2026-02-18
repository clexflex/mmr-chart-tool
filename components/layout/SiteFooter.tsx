import { ExternalLink, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-item">
          <span className="site-footer-label">Designed by</span>
          <a href="https://www.fatmangosolutions.com/" target="_blank" rel="noopener noreferrer">
            Yashraj Ghosalkar <ExternalLink size={14} aria-hidden />
          </a>
        </div>
        <div className="site-footer-item">
          <span className="site-footer-label">Follow me on</span>
          <a href="https://www.linkedin.com/in/yashrajghosalkar/" target="_blank" rel="noopener noreferrer">
            <Linkedin size={15} aria-hidden /> LinkedIn
          </a>
        </div>
        <div className="site-footer-item">
          <span className="site-footer-label">Designed for</span>
          <a href="https://www.maximizemarketresearch.com/" target="_blank" rel="noopener noreferrer">
            MMR <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
