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
    id: "boundaries",
    label: "Boundaries",
    aliases: ["boundaries", "boundary", "setting boundaries"],
    requiredSignals: ["boundaries", "boundary", "saying no", "need", "limits", "disappoint", "resentment", "ask for what you need"],
    driftSignals: ["fear of abandonment", "tone scanning", "delayed text", "over-texting", "panic after silence"]
  },
  {
    id: "people_pleasing",
    label: "People pleasing",
    aliases: ["people pleasing", "people-pleasing", "people pleaser"],
    requiredSignals: ["people pleasing", "saying yes", "disappoint", "approval", "conflict", "resentment", "needs", "guilt"],
    driftSignals: ["avoidant attachment", "anxious attachment", "diagnosis"]
  },
  {
    id: "perfectionism",
    label: "Perfectionism",
    aliases: ["perfectionism", "perfectionist"],
    requiredSignals: ["perfectionism", "mistake", "perfect", "grades", "email", "draft", "achievement", "standards"],
    driftSignals: ["laziness", "motivation problem", "avoidant attachment", "anxious attachment"]
  },
  {
    id: "social_anxiety",
    label: "Social anxiety",
    aliases: ["social anxiety", "socially anxious"],
    requiredSignals: ["social anxiety", "conversation", "group", "being judged", "replaying", "party", "class", "meeting", "social"],
    driftSignals: ["generalized anxiety", "avoidant attachment", "anxious attachment", "boundaries"]
  },
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
      hook: "The typing bubble appears. You want to answer, then your body goes quiet.",
      caption: [
        "You are not ignoring them.",
        "You are trying not to disappear inside the closeness.",
        "What I see in therapy: this pattern often gets misunderstood as not caring.",
        "From the outside, the distance can look cold or uninterested. What is actually happening can be more protective: closeness starts to feel like pressure, dependence feels unsafe, and shutting down feels like the only way to stay regulated.",
        "Avoidant attachment can look like needing space before responding, minimizing needs, withdrawing after emotional conversations, staying self-reliant, or feeling uncomfortable when someone wants vulnerability.",
        "The distance is not proof that there are no feelings. Sometimes space is the nervous system trying to prevent overwhelm.",
        "Sometimes \"I need space\" means \"I am trying not to shut down.\"",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with quiet space, a person looking away from a phone, muted navy and cream, and slide copy focused on distancing, shutdown, needing space, and minimizing needs.",
      script: "Avoidant attachment is not simply not caring. It can look like shutting down, needing space, minimizing needs, or pulling away when closeness starts to feel like pressure. What is actually happening is often protection, not absence of feeling."
    },
    anxious_attachment: {
      hook: "You are checking your phone again, and silence starts to feel like rejection.",
      caption: [
        "What I see in therapy: anxious attachment is often misunderstood as being too much.",
        "From the outside, reassurance seeking or over-texting can look like clinginess. What is actually happening psychologically is often fear of abandonment, hypervigilance, and a nervous system trying to restore connection when uncertainty feels unsafe.",
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
        "From the outside, secure attachment can get mistaken for never feeling anxious, never needing reassurance, and never getting hurt. What is actually happening psychologically is different: secure attachment means there is enough trust, repair, direct communication, emotional safety, and interdependence to move through disconnection without losing yourself.",
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
        "From the outside, the push-pull pattern can look like drama, mixed signals, or manipulation. What is actually happening psychologically can be a nervous system caught between wanting connection and fearing the very closeness it wants.",
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

export function generalTopicRepairCopy(topic: string, goal = "trust-building") {
  const normalizedTopic = normalize(topic);
  const cta = goal === "follower-growth"
    ? "Save this if it felt familiar, and follow @LHtherapy for emotionally honest mental health content."
    : "Use this as a reflection point before you decide the reaction is just a personal flaw.";

  if (normalizedTopic.includes("boundar")) {
    return {
      focus: "Boundaries",
      hook: "You type the boundary, then delete it before anyone can be disappointed.",
      caption: [
        "You know what you need.",
        "Then your body starts preparing for someone to be upset.",
        "What I see in therapy: boundaries often feel rude when you learned that keeping people comfortable was safer than being honest.",
        "This can look like overexplaining a no, apologizing before asking for space, saying yes while resentment builds, or waiting until you are exhausted before naming a limit.",
        "The boundary is not the problem. The fear of what might happen after the boundary is the part asking for attention.",
        "Sometimes a boundary is your nervous system learning that honesty does not have to equal danger.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with a deleted text message, soft navy and sage, and slide copy focused on saying no, overexplaining, guilt, and resentment.",
      script: "A boundary can feel rude when you learned that keeping people comfortable was safer than being honest. The work is not becoming harsh. The work is learning to stay connected to yourself while someone else has a feeling."
    };
  }

  if (normalizedTopic.includes("people pleasing") || normalizedTopic.includes("people pleaser")) {
    return {
      focus: "People pleasing",
      hook: "You say yes, then rehearse how exhausted you are allowed to feel.",
      caption: [
        "You smiled when you said it.",
        "Then your chest tightened on the way home.",
        "What I see in therapy: people pleasing is often fear wearing kindness clothes.",
        "This can look like rewriting a simple text, apologizing before asking for what you need, saying yes while resentment builds, or feeling responsible for everyone else's mood.",
        "The behavior makes more sense when you understand what it was trying to protect.",
        "Sometimes the old rule is: if no one is disappointed, I am safe.",
        "Your coping strategy is not your personality.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with a deleted boundary text, car after saying yes, and soft navy, cream, sage, and muted gold.",
      script: "People pleasing is not just being nice. It can be fear wearing kindness clothes. You say yes, then your body carries the resentment later because disappointing someone once felt unsafe."
    };
  }

  if (normalizedTopic.includes("social anxiety")) {
    return {
      focus: "Social anxiety",
      hook: "You leave the conversation, then replay one sentence for the rest of the night.",
      caption: [
        "You smiled.",
        "You answered.",
        "You looked calm enough.",
        "Then your brain started reviewing every pause, every facial expression, every word you wish you had said differently.",
        "What I see in therapy: social anxiety often looks like functioning in the moment and falling apart afterward.",
        "The fear is not always the conversation itself. Sometimes it is the imagined judgment your body starts preparing for after the conversation ends.",
        "Your coping strategy is not your personality.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with a quiet car after an event, muted navy, cream, and text-message style thought bubbles about replaying conversations.",
      script: "Social anxiety can look like seeming fine in the moment and replaying the entire conversation afterward. The body is trying to protect you from judgment, even when there is no clear danger in front of you."
    };
  }

  if (normalizedTopic.includes("perfection")) {
    return {
      focus: "Perfectionism",
      hook: "You rewrite the email six times because one mistake feels too expensive.",
      caption: [
        "It looks like high standards.",
        "Inside, it can feel like one wrong move will change how people see you.",
        "What I see in therapy: perfectionism is often fear wearing achievement clothes.",
        "What is actually happening is protective: the mind keeps trying to prevent the mistake before anyone else can notice it.",
        "This can look like avoiding the first draft, rereading a message until it stops sounding human, procrastinating because starting imperfectly feels unbearable, or treating every task like it has equal emotional weight.",
        "The behavior makes more sense when you understand what it was trying to protect.",
        "The goal is not to stop caring. The goal is to stop making every mistake feel like evidence against you.",
        "Your worth was never supposed to be graded by your output.",
        cta
      ].join("\n\n"),
      visualIdea: "Use an Emotional Hook Carousel with laptop notes, crossed-out drafts, and clean cream, sage, and muted gold details.",
      script: "Perfectionism can look like high achievement, but underneath it is often fear. Fear of mistakes. Fear of being seen as careless. Fear that your output is the evidence of your worth."
    };
  }

  if (normalizedTopic.includes("teen girls") || normalizedTopic.includes("parenting teen girls")) {
    const parentAngle = normalizedTopic.includes("parent");
    return {
      focus: parentAngle ? "Parenting teen girls" : "Teen girls",
      hook: parentAngle ? "She says \"I'm fine,\" then shuts her bedroom door before the tears come." : "She says \"I'm fine,\" then spends the night trying to hold herself together.",
      caption: [
        parentAngle ? "From the outside, it can look like attitude." : "From the outside, it can look like she does not care.",
        "What I see in therapy: teen girls often hide anxiety behind irritability, perfectionism, friendship stress, stomach aches, and shutting down.",
        parentAngle ? "A parent may ask what is wrong and get silence, not because their teen is trying to be cruel, but because she may not have words yet for the pressure she is carrying." : "She may be managing school pressure, friend-group tension, body image, grades, and the fear that needing help will worry everyone.",
        "The behavior makes more sense when you understand what it was trying to protect.",
        parentAngle ? "Sometimes support starts with less interrogation and more emotional safety." : "Sometimes \"I'm fine\" means \"I do not know how to explain this without falling apart.\"",
        cta
      ].join("\n\n"),
      visualIdea: "Use a Teen Mental Health Carousel with school hallway, notebook, bedroom, or phone visuals. Keep it soft, modern, and non-stock.",
      script: "Teen anxiety can hide behind irritability, perfectionism, stomach aches, or saying I'm fine. The behavior is not always attitude. Sometimes it is overwhelm without language yet."
    };
  }

  return null;
}
