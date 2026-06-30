import SchemaScript from "@/components/SchemaScript";
import { faqSchema } from "@/lib/schemas";
import { PAGE_METADATA } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_METADATA.faq;

export default function FAQPage() {
  return (
    <>
      <SchemaScript schema={faqSchema} />
      <main className="faq-main">
        <div className="faq-container">
          <h1 className="faq-heading">Frequently Asked Questions</h1>
          <p className="faq-intro">
            Everything you need to know before booking your stay at Sukhakarta Holiday Home, Alibag.
          </p>

          <div className="faq-list">
            {faqSchema.mainEntity.map((item, i) => (
              <div className="faq-item" key={i}>
                <h2 className="faq-question">{item.name}</h2>
                <p className="faq-answer">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .faq-main {
            min-height: 70vh;
            padding: 7rem 1.5rem 5rem;
            background: #04070f;
          }
          .faq-container {
            max-width: 760px;
            margin: 0 auto;
          }
          .faq-heading {
            font-family: var(--font-cormorant), Georgia, serif;
            font-size: clamp(2rem, 4vw, 2.75rem);
            font-weight: 700;
            color: #ededed;
            margin: 0 0 0.75rem;
          }
          .faq-intro {
            font-family: var(--font-outfit), system-ui, sans-serif;
            font-size: 1.05rem;
            color: rgba(237,237,237,0.7);
            margin: 0 0 2.5rem;
            line-height: 1.6;
          }
          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .faq-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(249,115,22,0.15);
            border-radius: 14px;
            padding: 1.5rem 1.75rem;
          }
          .faq-question {
            font-family: var(--font-cormorant), Georgia, serif;
            font-size: 1.3rem;
            font-weight: 600;
            color: #f97316;
            margin: 0 0 0.6rem;
          }
          .faq-answer {
            font-family: var(--font-outfit), system-ui, sans-serif;
            font-size: 0.98rem;
            line-height: 1.65;
            color: rgba(237,237,237,0.85);
            margin: 0;
          }
        `}</style>
      </main>
    </>
  );
}
