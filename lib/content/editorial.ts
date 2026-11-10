/**
 * Editorial content for the homepage.
 *
 * Everything here is demonstration content. No publication dates, research
 * findings, or statistics are invented: unknown values stay null and render
 * as labelled placeholders until real articles are connected.
 */
export type PlateId = "interface" | "network" | "imaging" | "modulation" | "neuron" | "signal" | "contour";

export type NeuroByteTopic = {
  id: string;
  figure: string;
  title: string;
  summary: string;
  plate: PlateId;
};

export const neuroByteTopics: readonly NeuroByteTopic[] = [
  {
    id: "bci",
    figure: "Fig. 01",
    title: "Brain computer interfaces",
    summary: "How recorded neural signals can be translated into commands for a cursor, a speller, or a prosthetic limb.",
    plate: "interface",
  },
  {
    id: "ai",
    figure: "Fig. 02",
    title: "Artificial intelligence in neurology",
    summary: "Where machine learning is being studied in diagnosis and monitoring, and where its limits still are.",
    plate: "network",
  },
  {
    id: "imaging",
    figure: "Fig. 03",
    title: "Neuroimaging",
    summary: "What MRI, CT, and PET each measure, and how to read the pictures they produce.",
    plate: "imaging",
  },
  {
    id: "modulation",
    figure: "Fig. 04",
    title: "Neuromodulation",
    summary: "Stimulation therapies that adjust neural activity with electrical or magnetic pulses.",
    plate: "modulation",
  },
  {
    id: "brain",
    figure: "Fig. 05",
    title: "Understanding the brain",
    summary: "Neurons, networks, and the fundamentals behind every other story we publish.",
    plate: "neuron",
  },
  {
    id: "innovation",
    figure: "Fig. 06",
    title: "Neurotechnology innovations",
    summary: "New devices and methods as they move from the laboratory toward the clinic.",
    plate: "signal",
  },
];

export type Article = {
  id: string;
  category: string;
  title: string;
  dek: string;
  author: string;
  /** ISO date once published. Null renders a labelled placeholder. */
  publishedAt: string | null;
  /** Minutes. Null renders a labelled placeholder. */
  readingMinutes: number | null;
  plate: PlateId;
};

export const featuredArticle: Article = {
  id: "sample-feature",
  category: "Sample feature",
  title: "One week in neurology, read closely",
  dek: "Each edition will choose the developments that matter most that week, explain what was actually shown, and say plainly what remains uncertain.",
  author: "Amna Noor",
  publishedAt: null,
  readingMinutes: null,
  plate: "contour",
};

export const supportingArticles: readonly Article[] = [
  {
    id: "sample-explainer",
    category: "Sample explainer",
    title: "How to read a neurology headline",
    dek: "A short guide to study size, study design, and the distance between a result and a treatment.",
    author: "Amna Noor",
    publishedAt: null,
    readingMinutes: null,
    plate: "signal",
  },
  {
    id: "sample-technology",
    category: "Sample technology note",
    title: "What a device trial can and cannot tell us",
    dek: "Why early results from neurotechnology studies deserve both interest and patience.",
    author: "Amna Noor",
    publishedAt: null,
    readingMinutes: null,
    plate: "interface",
  },
  {
    id: "sample-global",
    category: "Sample global view",
    title: "Neurology beyond the largest research centres",
    dek: "A regular look at work from regions that major coverage often overlooks.",
    author: "Amna Noor",
    publishedAt: null,
    readingMinutes: null,
    plate: "network",
  },
];

/** Consultation details stay unconfirmed until clinical practice is authorized. */
export const consultationSteps = [
  { title: "Appointment types", detail: "To be confirmed" },
  { title: "Appointment duration", detail: "To be confirmed" },
  { title: "Availability", detail: "To be confirmed" },
  { title: "Secure booking", detail: "Provider to be confirmed" },
] as const;
