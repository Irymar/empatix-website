-- Seed homepage collections so inline CMS editing works on the landing page.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

-- ====== Services (4 homepage cards) ======
INSERT INTO public.content_items (collection, data, sort_order, status)
VALUES
  ('services', jsonb_build_object(
    'number', '01',
    'title', 'Digital Product Development',
    'linkHref', '/services',
    'summary', 'Web, mobile, SaaS, CRM, fintech and internal tools — taken from first sketch to a product your customers use',
    'tags', 'Discovery' || chr(10) || 'UX/UI' || chr(10) || 'Architecture' || chr(10) || 'Engineering' || chr(10) || 'QA' || chr(10) || 'Launch'
  ), 0, 'published'),
  ('services', jsonb_build_object(
    'number', '02',
    'title', 'AI Implementation',
    'linkHref', '/ai-solutions',
    'summary', 'Assistants, RAG, contract analysis, AI SDRs and mentors — built on your own data and shipped into real workflows',
    'tags', 'RAG' || chr(10) || 'AI Agents' || chr(10) || 'Private data' || chr(10) || 'OpenAI' || chr(10) || 'LangChain'
  ), 10, 'published'),
  ('services', jsonb_build_object(
    'number', '03',
    'title', 'Business Automation',
    'linkHref', '/services',
    'summary', 'Connect the tools your team already lives in — CRMs, inboxes, spreadsheets — so manual work stops eating the week',
    'tags', 'n8n' || chr(10) || 'Zapier' || chr(10) || 'Node.js' || chr(10) || 'CRM' || chr(10) || 'APIs'
  ), 20, 'published'),
  ('services', jsonb_build_object(
    'number', '04',
    'title', 'CTO-as-a-Service',
    'linkHref', '/services',
    'summary', 'A senior tech partner for founders and operators: architecture calls, roadmap, vendor control, risk — without a full-time hire',
    'tags', 'Architecture' || chr(10) || 'Roadmap' || chr(10) || 'Vendor control' || chr(10) || 'Risk'
  ), 30, 'published');

-- ====== Case Studies (4 homepage featured cases) ======
INSERT INTO public.content_items (collection, data, sort_order, status)
VALUES
  ('case_studies', jsonb_build_object(
    'name', 'Fine Clause',
    'kind', 'AI Contract Analysis',
    'summary', 'Reads legal documents and surfaces the clauses, risks and obligations a human would otherwise hunt for',
    'outcome', '−70% contract review time',
    'chips', 'LegalTech' || chr(10) || 'RAG' || chr(10) || 'Document AI',
    'image', ''
  ), 0, 'published'),
  ('case_studies', jsonb_build_object(
    'name', 'AI SDR Automation',
    'kind', 'Sales Automation',
    'summary', 'Enriches leads, personalises outreach and keeps the CRM clean — so reps spend time on real conversations',
    'outcome', '3× qualified meetings per SDR',
    'chips', 'AI Agents' || chr(10) || 'CRM' || chr(10) || 'n8n',
    'image', ''
  ), 10, 'published'),
  ('case_studies', jsonb_build_object(
    'name', 'Galaxy Connext',
    'kind', 'Gamification for Kids',
    'summary', 'A gamified app that drives learning, engagement and sponsor opportunities for younger audiences',
    'outcome', '4.8★ retention with 35% DAU lift',
    'chips', 'Mobile' || chr(10) || 'Gamification' || chr(10) || 'EdTech',
    'image', ''
  ), 20, 'published'),
  ('case_studies', jsonb_build_object(
    'name', 'Site Parsers',
    'kind', 'Data Engineering',
    'summary', 'Custom parsers that feed lead gen, market research and AI datasets — reliably, at scale',
    'outcome', '10M+ pages/day at 99.5% uptime',
    'chips', 'Parsing' || chr(10) || 'Big Data' || chr(10) || 'Pipelines',
    'image', ''
  ), 30, 'published');

-- ====== Final CTA section defaults ======
INSERT INTO public.content_sections (key, data, status)
VALUES (
  'final_cta',
  jsonb_build_object(
    'title', 'Ready to ship faster?',
    'body', 'Book a 30-minute discovery call. We will read your brief, ask the right questions, and come back with a straight opinion on scope, stack and timeline.',
    'primaryLabel', 'Book a discovery call',
    'primaryHref', 'https://quotes.empatixtech.com/',
    'secondaryLabel', 'See our work',
    'secondaryHref', '/cases'
  ),
  'published'
)
ON CONFLICT (key) DO NOTHING;

-- ====== Services header defaults ======
INSERT INTO public.content_sections (key, data, status)
VALUES (
  'services_header',
  jsonb_build_object(
    'eyebrow', 'What we build',
    'title', 'Four ways we accelerate your product',
    'linkLabel', 'All services',
    'linkHref', '/services'
  ),
  'published'
)
ON CONFLICT (key) DO NOTHING;

-- ====== Cases header defaults ======
INSERT INTO public.content_sections (key, data, status)
VALUES (
  'cases_header',
  jsonb_build_object(
    'eyebrow', 'Selected work',
    'title', 'Products and cases we are proud of',
    'linkLabel', 'All cases',
    'linkHref', '/cases'
  ),
  'published'
)
ON CONFLICT (key) DO NOTHING;
