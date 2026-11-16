/**
 * Editorial content for the homepage.
 *
 * Everything here is demonstration content. No publication dates, research
 * findings, or statistics are invented: unknown values stay null and nothing
 * is shown in their place until real articles are connected.
 */
export type PlateId = "interface" | "network" | "imaging" | "modulation" | "neuron" | "signal" | "contour";

export type NeuroByteTopic = {
  slug: string;
  figure: string;
  category: string;
  title: string;
  summary: string;
  /** A longer description for the topic's own page. */
  about: string;
  plate: PlateId;
};

/** The first entry is the featured topic. */
export const neuroByteTopics: readonly NeuroByteTopic[] = [
  {
    slug: "brain-computer-interfaces",
    figure: "Fig. 01",
    category: "Neurotechnology",
    title: "Brain computer interfaces",
    summary: "How recorded neural signals can be translated into commands for a cursor, a speller, or a prosthetic limb.",
    about: "This NeuroByte will explain what a brain computer interface records, how those signals are decoded, and what separates a laboratory demonstration from a device a person can rely on.",
    plate: "interface",
  },
  {
    slug: "artificial-intelligence-in-neurology",
    figure: "Fig. 02",
    category: "Artificial intelligence",
    title: "Artificial intelligence in neurology",
    summary: "Where machine learning is being studied in diagnosis and monitoring, and where its limits still are.",
    about: "This NeuroByte will look at where machine learning is being studied in neurology, what it is being asked to do, and the questions a careful reader should ask of any claim made for it.",
    plate: "network",
  },
  {
    slug: "neuroimaging",
    figure: "Fig. 03",
    category: "Imaging",
    title: "Neuroimaging",
    summary: "What MRI, CT, and PET each measure, and how to read the pictures they produce.",
    about: "This NeuroByte will describe what each major imaging method actually measures, why they produce such different pictures, and what each can and cannot show.",
    plate: "imaging",
  },
  {
    slug: "neuromodulation",
    figure: "Fig. 04",
    category: "Therapies",
    title: "Neuromodulation",
    summary: "Stimulation therapies that adjust neural activity with electrical or magnetic pulses.",
    about: "This NeuroByte will introduce the main forms of neuromodulation, the principle they share, and the kinds of conditions in which they are used or studied.",
    plate: "modulation",
  },
  {
    slug: "understanding-the-brain",
    figure: "Fig. 05",
    category: "Foundations",
    title: "Understanding the brain",
    summary: "Neurons, networks, and the fundamentals behind every other story we publish.",
    about: "This NeuroByte will set out the fundamentals: what a neuron does, how neurons form networks, and how those networks give rise to what the brain can do.",
    plate: "neuron",
  },
  {
    slug: "neurotechnology-innovations",
    figure: "Fig. 06",
    category: "Innovation",
    title: "Neurotechnology innovations",
    summary: "New devices and methods as they move from the laboratory toward the clinic.",
    about: "This NeuroByte will follow new devices and methods on their way from early research toward clinical use, and explain the stages in between.",
    plate: "signal",
  },
];

export type Article = {
  id: string;
  category: string;
  title: string;
  dek: string;
  author: string;
  /** ISO date once published. Null until then: no date is shown. */
  publishedAt: string | null;
  /** Minutes, measured from the finished text. Null until then: no reading time is shown. */
  readingMinutes: number | null;
};

export const featuredArticle: Article = {
  id: "sample-feature",
  category: "Sample feature",
  title: "One week in neurology, read closely",
  dek: "Each edition will choose the developments that matter most that week, explain what was actually shown, and say plainly what remains uncertain.",
  author: "Amna Noor",
  publishedAt: null,
  readingMinutes: null,
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
  },
  {
    id: "sample-technology",
    category: "Sample technology note",
    title: "What a device trial can and cannot tell us",
    dek: "Why early results from neurotechnology studies deserve both interest and patience.",
    author: "Amna Noor",
    publishedAt: null,
    readingMinutes: null,
  },
  {
    id: "sample-global",
    category: "Sample global view",
    title: "Neurology beyond the largest research centres",
    dek: "A regular look at work from regions that major coverage often overlooks.",
    author: "Amna Noor",
    publishedAt: null,
    readingMinutes: null,
  },
];

/**
 * How scheduling works. These describe the booking tool only.
 * Appointment length, price, and type are never stated here: the calendar shows them.
 */
export const bookingSteps = [
  { title: "Choose a time", detail: "Pick a slot from the calendar. Times are shown in your own time zone." },
  { title: "Add your details", detail: "Fill in Calendly's short scheduling form. Please leave out medical details." },
  { title: "Receive confirmation", detail: "Calendly emails a confirmation with the details of your appointment." },
] as const;
