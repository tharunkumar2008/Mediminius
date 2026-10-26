import React from 'react';
import { BookOpen, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import { PHARMACY_ARTICLES } from '../data/products';

export default function HealthArticlesSection({ onReadArticle }) {
  return (
    <section className="articles-section">
      <div className="med-container">
        <div className="section-header">
          <div>
            <div className="section-label">
              <BookOpen size={14} />
              <span>Pharmacy Health Knowledge Hub</span>
            </div>
            <h2 className="section-title">Clinical Guidance & Medication Safety</h2>
            <p className="section-subtitle">
              Evidence-based tips from our licensed pharmacists to help you take medicines safely
            </p>
          </div>
        </div>

        <div className="articles-grid">
          {PHARMACY_ARTICLES.map((article) => (
            <article key={article.id} className="article-card">
              <span className="article-tag">{article.category}</span>
              <h4>{article.title}</h4>
              <p>{article.excerpt}</p>

              <div className="article-meta">
                <span>{article.readTime} • {article.date}</span>
                <button 
                  className="article-read-btn"
                  onClick={() => onReadArticle(article)}
                  style={{ background: 'none', border: 'none' }}
                >
                  Read Guide <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
