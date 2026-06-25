export type TopicMatchStrength = "Strong" | "Partial" | "Drifted";

export type TopicFidelityResult = {
  requestedTopic: string;
  generatedFocus: string;
  topicMatch: TopicMatchStrength;
  warning?: string;
  reasons: string[];
};

type TopicProfile = {
  id: string;
  label: string;
  aliases: string[];
  requiredSignals: string[];
  driftSignals: string[];
};

const attachmentProfiles: TopicProfile[] = [
  {
    id: "avoidant_attachment",
    label: "Avoidant attachment",
    aliases: ["avoidant attachment", "avoidant", "dismissive avoidant", "avoidant style"],
    requiredSignals: ["avoidant", "distancing", "distance", "shutting down", "shutdown", "needing space", "space", "independence", "self reliance", "self-reliance", "minimizing needs", "minimize needs", "withdrawing", "withdrawal", "discomfort with dependence", "dependence feels unsafe", "deactivating"],
    driftSignals: ["reassurance seeking", "fear of abandonment", "over texting", "over-texting", "tone scanning", "hypervigilance", "protest behavior", "protest behaviors", "clingy", "chasing"]
  },
  {
    id: "anxious_attachment",
    label: "Anxious attachment",
    aliases: ["anxious attachment", "anxious", "preoccupied attachment", "anxious style"],
    requiredSignals: ["anxious", "reassurance seeking", "fear of abandonment", "abandonment", "over texting", "over-texting", "tone scanning", "hypervigilance", "protest behavior", "protest behaviors", "checking for tone", "delayed text", "silence as rejection"],
    driftSignals: ["distancing", "needing space", "minimizing needs", "self reliance", "self-reliance", "withdrawing", "deactivating", "discomfort with dependence"]
  },
  {
    id: "secure_attachment",
    label: "Secure attachment",
    aliases: ["secure attachment", "secure", "secure attachment style"],
    requiredSignals: ["secure", "repair", "trust", "direct communication", "emotional safety", "interdependence", "healthy dependence", "consistent", "clarity", "boundaries", "connection and autonomy"],
    driftSignals: ["fear of abandonment", "over texting", "distancing", "shutting down", "push pull", "chaotic", "hot and cold"]
  },
  {
    id: "disorganized_attachment",
    label: "Disorganized attachment",
    aliases: ["disorganized attachment", "disorganized", "fearful avoidant", "fearful-avoidant"],
    requiredSignals: ["disorganized", "fearful avoidant", "fearful-avoidant", "push pull", "push-pull", "wanting closeness and fearing it", "chaotic", "freeze", "confusing closeness", "frightened", "hot and cold", "approach avoid"],
    driftSignals: ["only reassurance seeking", "only distancing", "secure repair", "consistent safety"]
  }
];

const generalProfiles: TopicProfile[] = [
  {
    id: "depression",
    label: "Depression",
    aliases: ["depression", "depressive", "functional depression"],
    requiredSignals: ["depression", "depressive", "low mood", "numb", "hopeless", "empty", "loss of interest", "exhaustion", "withdrawal"],
    driftSignals: ["anxiety", "panic", "worry", "overthinking", "threat response"]
  },
  {
    id: "anxiety",
    label: "Anxiety",
    aliases: ["anxiety", "anxious", "panic", "worry"],
    requiredSignals: ["anxiety", "anxious", "panic", "worry", "overthinking", "reassurance", "threat response", "avoidance"],
    driftSignals: ["depression", "hopeless", "loss of interest", "empty", "numb"]
  },
  {
    id: "teen_girls",
    label: "Teen girls",
    aliases: ["teen girls", "teen girl", "adolescent girls", "high school girls"],
    requiredSignals: ["teen girls", "teen girl", "adolescent girls", "school", "friendships", "parents", "grades", "class", "after school"],
    driftSignals: ["adults", "workplace", "marriage", "college women", "moms"]
  },
  {
    id: "parent_audience",
    label: "Parent audience",
    aliases: ["parents", "parent audience", "moms", "dads", "caregivers"],
    requiredSignals: ["parent", "parents", "mom", "dad", "caregiver", "your teen", "your child", "after school", "homework"],
    driftSignals: ["when you feel", "your partner", "dating", "work meeting"]
  }
];

const profiles = [...attachmentProfiles, ...generalProfiles];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesSignal(text: string, signal: string) {
  return normalize(text).includes(normalize(signal));
}

function scoreSignals(text: string, signals: string[]) {
  return signals.reduce((score, signal) => score + (includesSignal(text, signal) ? 1 : 0), 0);
}

function findRequestedProfile(topic: string) {
  const normalizedTopic = normalize(topic);
  return profiles.find((profile) => profile.aliases.some((alias) => normalizedTopic.includes(normalize(alias))));
}

function findRequestedAttachmentProfile(topic: string) {
  const normalizedTopic = normalize(topic);
  return attachmentProfiles.find((profile) => profile.aliases.some((alias) => normalizedTopic.includes(normalize(alias))));
}

function strongestAttachmentFocus(text: string) {
  const scores = attachmentProfiles.map((profile) => ({
    profile,
    score: scoreSignals(text, profile.requiredSignals)
  })).sort((a, b) => b.score - a.score);
  return scores[0]?.score ? scores[0] : null;
}

function exactTopicWords(topic: string) {
  return normalize(topic)
    .split(" ")
    .filter((word) => word.length > 3 && !["post", "about", "with", "that", "this", "style"].includes(word));
}

export function topicFidelityInstruction(topic: string) {
  const normalizedTopic = normalize(topic);
  const requestedAttachment = attachmentProfiles.find((profile) => profile.aliases.some((alias) => normalizedTopic.includes(normalize(alias))));
  const attachmentRules = requestedAttachment ? `
Attachment topic fidelity:
- Requested style: ${requestedAttachment.label}.
- Keep ${requestedAttachment.label} as the central subject in hook, caption, examples, visual direction, and script.
- Avoidant attachment means distancing, shutting down, needing space, discomfort with dependence, minimizing needs, withdrawing, and self-reliance as protection.
- Anxious attachment means reassurance seeking, fear of abandonment, protest behaviors, over-texting, tone scanning, and hypervigilance.
- Secure attachment means repair, trust, direct communication, emotional safety, interdependence, and consistent connection.
- Disorganized attachment means push-pull, fear of closeness and distance, confusing safety cues, freeze responses, and chaotic approach-avoid patterns.
- Related attachment styles may be mentioned only for comparison. Do not make a different attachment style the main focus.
` : "";

  return `
Topic fidelity rules:
- Requested topic: ${topic}.
- The requested topic must remain the central subject of every generated field.
- Related concepts may be mentioned only for contrast, context, or comparison.
- Do not drift into a related but different concept.
- If the topic names a specific audience, keep that audience as the main audience.
- If the topic names parents, write to or about parents. If it names teens, keep teens central.
${attachmentRules}
`;
}

export function assessTopicFidelity(input: {
  requestedTopic: string;
  contentAngle?: string | null;
  hook?: string | null;
  caption?: string | null;
  visualIdea?: string | null;
  script?: string | null;
}) {
  const requestedTopic = input.requestedTopic.trim();
  const allText = [
    input.contentAngle,
    input.hook,
    input.caption,
    input.visualIdea,
    input.script
  ].filter(Boolean).join(" ");
  const normalizedText = normalize(allText);
  const requestedProfile = findRequestedProfile(requestedTopic);
  const reasons: string[] = [];

  if (!requestedProfile) {
    const topicWords = exactTopicWords(requestedTopic);
    const matchedWords = topicWords.filter((word) => normalizedText.includes(word));
    const matchRatio = topicWords.length ? matchedWords.length / topicWords.length : 1;
    const topicMatch: TopicMatchStrength = matchRatio >= 0.75 ? "Strong" : matchRatio >= 0.4 ? "Partial" : "Drifted";
    if (topicMatch !== "Strong") reasons.push("The generated copy does not clearly name enough of the requested topic language.");
    return {
      requestedTopic,
      generatedFocus: matchedWords.length ? requestedTopic : "Unclear or adjacent topic",
      topicMatch,
      warning: topicMatch === "Drifted" ? "This draft may have drifted from your requested topic." : undefined,
      reasons
    };
  }

  const requestedScore = scoreSignals(allText, requestedProfile.requiredSignals);
  const driftScore = scoreSignals(allText, requestedProfile.driftSignals);
  const attachmentFocus = strongestAttachmentFocus(allText);
  let generatedFocus = requestedScore ? requestedProfile.label : "Unclear or adjacent topic";
  if (attachmentFocus?.profile && attachmentFocus.score > requestedScore) generatedFocus = attachmentFocus.profile.label;

  let topicMatch: TopicMatchStrength = "Strong";
  if (!requestedScore || (attachmentFocus?.profile.id && attachmentFocus.profile.id !== requestedProfile.id && attachmentFocus.score > requestedScore)) {
    topicMatch = "Drifted";
  } else if (driftScore > 0 || requestedScore < 2) {
    topicMatch = "Partial";
  }

  if (!requestedScore) reasons.push(`The draft does not clearly include ${requestedProfile.label} signals.`);
  if (driftScore > 0) reasons.push("The draft includes signals from a related but different concept.");
  if (attachmentFocus?.profile.id && attachmentFocus.profile.id !== requestedProfile.id && attachmentFocus.score > requestedScore) {
    reasons.push(`The strongest detected attachment focus is ${attachmentFocus.profile.label}, not ${requestedProfile.label}.`);
  }

  return {
    requestedTopic,
    generatedFocus,
    topicMatch,
    warning: topicMatch === "Drifted" ? "This draft may have drifted from your requested topic." : undefined,
    reasons
  };
}

export function attachmentTopicRepairCopy(topic: string, goal = "trust-building") {
  const profile = findRequestedAttachmentProfile(topic);
  if (!profile) return null;

  const cta = goal === "follower-growth"
    ? "Save this if this pattern felt familiar, and follow @LHtherapy for emotionally honest mental health content."
    : "Use this as a reflection point before you label the behavior as uncaring, needy, or confusing.";

  const copy: Record<string, { hook: string; caption: string; visualIdea: string; script: string }> = {
    avoidant_attachment: {
      hook: "Avoidant attachment can look like needing space before you can name what you feel",
      caption: [
        "What I see in therapy: avoidant attachment is often misunderstood as not caring.",
        "Many people assume the distance means someone is cold, unavailable, or uninterested. What is actually happening psychologically can be more protective: closeness may feel like pressure, dependence may feel unsafe, and shutting down may feel like the only way to stay regulated.",
        "Avoidant attachment can look like withdrawing after emotional conversations, minimizing needs, needing space before responding, staying very self-reliant, or feeling uncomfortable when someone wants reassurance or vulnerability.",
        "The distancing is not the same thing as not having feelings. It can be a deactivating strategy: the body moves away from dependence before the person has language for the fear underneath.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with quiet space, a person looking away from a phone, muted navy and cream, and slide copy focused on distancing, shutdown, needing space, and minimizing needs.",
      script: "Avoidant attachment is not simply not caring. It can look like shutting down, needing space, minimizing needs, or pulling away when closeness starts to feel like pressure. What is actually happening is often protection, not absence of feeling."
    },
    anxious_attachment: {
      hook: "Anxious attachment can feel like your body starts searching for rejection before your mind catches up",
      caption: [
        "What I see in therapy: anxious attachment is often misunderstood as being too much.",
        "Many people assume reassurance seeking or over-texting is clinginess. What is actually happening psychologically is often fear of abandonment, hypervigilance, and a nervous system trying to restore connection when uncertainty feels unsafe.",
        "Anxious attachment can look like rereading texts, scanning for tone changes, panicking after delayed replies, overexplaining after conflict, or needing reassurance before your body can settle.",
        "The urgency makes sense, but it is not always a sign that something is wrong in the relationship. Sometimes it is the body responding to old inconsistency as if it is happening again.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with text-message style visuals, soft contrast, and slide copy focused on reassurance seeking, delayed replies, tone scanning, and fear of abandonment.",
      script: "Anxious attachment is not simply being too needy. It can be the body scanning for abandonment through delayed replies, tone shifts, silence, or conflict. The work is learning to notice the alarm without letting the alarm run the whole relationship."
    },
    secure_attachment: {
      hook: "Secure attachment is not never feeling triggered. It is knowing repair is possible",
      caption: [
        "What I see in therapy: secure attachment is often misunderstood as constant calm.",
        "Many people assume secure attachment means you never feel anxious, never need reassurance, and never get hurt. What is actually happening psychologically is different: secure attachment means there is enough trust, repair, direct communication, emotional safety, and interdependence to move through disconnection without losing yourself.",
        "Secure attachment can look like asking for clarity instead of testing someone, naming a need without apologizing for having one, taking space without disappearing, or returning to repair after conflict.",
        "The goal is not perfect regulation. The goal is a relationship pattern where connection and autonomy can both exist.",
        cta
      ].join("\n\n"),
      visualIdea: "Use a Therapist Education Carousel with calm cream, sage, and muted navy. Show secure repair, direct communication, emotional safety, boundaries, and interdependence.",
      script: "Secure attachment is not never being triggered. It is having enough trust and emotional safety to repair, communicate directly, and stay connected without abandoning yourself."
    },
    disorganized_attachment: {
      hook: "Disorganized attachment can feel like wanting closeness and fearing it at the same time",
      caption: [
        "What I see in therapy: disorganized attachment is often misunderstood as being confusing on purpose.",
        "Many people assume the push-pull pattern is drama, mixed signals, or manipulation. What is actually happening psychologically can be a nervous system caught between wanting connection and fearing the very closeness it wants.",
        "Disorganized attachment can look like reaching out, then shutting down. Wanting reassurance, then feeling trapped by it. Feeling drawn to someone, then panicking when they get close. Going hot and cold because safety cues feel inconsistent inside the body.",
        "This pattern is not simply anxious attachment or avoidant attachment. It is often an approach-avoid response where closeness and danger can feel tangled together.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with moody but gentle visuals, split-frame tension, and slide copy focused on push-pull, fear of closeness, freeze, hot-cold responses, and confusing safety cues.",
      script: "Disorganized attachment can feel like wanting closeness and fearing it at the same time. It is not just anxious or avoidant. It can be a push-pull response where the body reaches for connection and protects against it."
    }
  };

  return {
    focus: profile.label,
    ...copy[profile.id]
  };
}
