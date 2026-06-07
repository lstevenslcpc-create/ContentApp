import { findClosestTopic } from "./topicIntelligence";

export type PsychologyConceptCategory =
  | "CBT"
  | "Attachment"
  | "Trauma"
  | "Nervous System"
  | "ADHD"
  | "Behavioral"
  | "DBT";

export type PsychologyConcept = {
  name: string;
  category: PsychologyConceptCategory;
  simpleExplanation: string;
  therapistExplanation: string;
  socialMediaExplanation: string;
};

export type TopicPsychologyConceptMap = {
  topicName: string;
  concepts: PsychologyConcept[];
};

export const TOPIC_PSYCHOLOGY_CONCEPTS: TopicPsychologyConceptMap[] = [
  {
    topicName: "Teen Anxiety",
    concepts: [
      {
        name: "Avoidance Cycle",
        category: "CBT",
        simpleExplanation: "Avoiding something scary lowers anxiety for a moment, but makes the fear stronger over time.",
        therapistExplanation: "Avoidance provides short-term relief that reinforces the belief that the feared situation is unsafe or unmanageable.",
        socialMediaExplanation: "When a teen avoids the assignment, the hallway, or the conversation, anxiety gets temporary relief and more power next time."
      },
      {
        name: "Threat Detection",
        category: "Nervous System",
        simpleExplanation: "The brain and body start scanning for danger, even when the danger is social, academic, or emotional.",
        therapistExplanation: "Anxiety can increase sensitivity to cues of evaluation, rejection, uncertainty, or failure, activating protective body responses.",
        socialMediaExplanation: "Teen anxiety can make school feel like a threat radar: grades, friends, tone, teachers, lunch, all of it."
      },
      {
        name: "Safety Behaviors",
        category: "CBT",
        simpleExplanation: "Safety behaviors are things people do to feel less anxious that can accidentally keep anxiety going.",
        therapistExplanation: "Reassurance seeking, checking, overpreparing, and avoidance can reduce distress short term while preventing corrective learning.",
        socialMediaExplanation: "Checking grades 10 times may calm the body for five minutes, but it teaches anxiety to keep asking."
      },
      {
        name: "Negative Reinforcement",
        category: "Behavioral",
        simpleExplanation: "When avoiding something removes discomfort, the brain learns to avoid it again.",
        therapistExplanation: "The removal of anxious distress strengthens avoidance behavior, even when avoidance creates long-term impairment.",
        socialMediaExplanation: "Staying home feels better today, so anxiety votes for staying home tomorrow too."
      },
      {
        name: "Emotion Coaching",
        category: "DBT",
        simpleExplanation: "Adults help teens name feelings before jumping into correction or problem-solving.",
        therapistExplanation: "Validation and emotional labeling can reduce shame, increase regulation, and make problem-solving more accessible.",
        socialMediaExplanation: "Try: I notice mornings feel harder lately. Do you want help solving it or do you need a quiet minute?"
      }
    ]
  },
  {
    topicName: "Anxious Attachment",
    concepts: [
      {
        name: "Attachment Activation",
        category: "Attachment",
        simpleExplanation: "The attachment system turns on when connection feels uncertain or threatened.",
        therapistExplanation: "Perceived distance, ambiguity, or rupture can activate proximity-seeking strategies and emotional alarm.",
        socialMediaExplanation: "A delayed text can feel like danger when your attachment system thinks connection is at risk."
      },
      {
        name: "Hypervigilance",
        category: "Nervous System",
        simpleExplanation: "The body scans for tiny signs that something is wrong.",
        therapistExplanation: "Relational hypervigilance increases sensitivity to tone, timing, facial expression, and perceived emotional distance.",
        socialMediaExplanation: "When their tone changes and your whole body starts looking for what went wrong, that is hypervigilance."
      },
      {
        name: "Reassurance Seeking",
        category: "CBT",
        simpleExplanation: "Asking for reassurance can calm anxiety briefly, but the calm may not last.",
        therapistExplanation: "Compulsive reassurance seeking can maintain intolerance of uncertainty and dependence on external soothing.",
        socialMediaExplanation: "Reassurance can feel like oxygen, then anxiety asks for another breath five minutes later."
      },
      {
        name: "Protest Behavior",
        category: "Attachment",
        simpleExplanation: "People may try to get closeness indirectly when asking directly feels too risky.",
        therapistExplanation: "Protest behaviors are attachment strategies used to restore proximity, often through testing, withdrawing, or escalating.",
        socialMediaExplanation: "Pulling away to see if they come closer is not random. It may be a scared attachment strategy."
      },
      {
        name: "Emotion Regulation",
        category: "DBT",
        simpleExplanation: "The goal is to notice the feeling and choose a steadier response.",
        therapistExplanation: "Emotion regulation skills support distress tolerance, cognitive clarity, and values-aligned communication under attachment threat.",
        socialMediaExplanation: "Before sending the panic text, name the cue, name the story, and let your body come down a notch."
      }
    ]
  },
  {
    topicName: "People Pleasing",
    concepts: [
      {
        name: "Fawn Response",
        category: "Trauma",
        simpleExplanation: "Fawning means staying safe by pleasing, appeasing, or becoming easy for others.",
        therapistExplanation: "The fawn response is a survival strategy that reduces perceived threat through compliance, appeasement, or self-abandonment.",
        socialMediaExplanation: "People pleasing can look like kindness from the outside and survival from the inside."
      },
      {
        name: "Boundary Guilt",
        category: "Behavioral",
        simpleExplanation: "Feeling guilty after a boundary does not mean the boundary was wrong.",
        therapistExplanation: "Boundary guilt can emerge when new assertive behavior conflicts with learned roles, attachment fears, or family expectations.",
        socialMediaExplanation: "Guilt after saying no may be your nervous system missing the old people-pleasing pattern."
      },
      {
        name: "Interpersonal Effectiveness",
        category: "DBT",
        simpleExplanation: "This means asking clearly, saying no, and keeping self-respect in relationships.",
        therapistExplanation: "DBT interpersonal effectiveness supports direct requests, boundaries, relationship preservation, and self-respect.",
        socialMediaExplanation: "A boundary can be kind, short, and still disappointing to someone. All three can be true."
      },
      {
        name: "Approval Seeking",
        category: "CBT",
        simpleExplanation: "The person looks outside themselves to know if they are safe or okay.",
        therapistExplanation: "Approval seeking can maintain anxiety by making internal safety dependent on external emotional responses.",
        socialMediaExplanation: "If you cannot relax until everyone approves, your body may be treating approval like safety."
      }
    ]
  },
  {
    topicName: "Perfectionism",
    concepts: [
      {
        name: "All-or-Nothing Thinking",
        category: "CBT",
        simpleExplanation: "The brain treats anything less than perfect as failure.",
        therapistExplanation: "Dichotomous thinking narrows evaluation into success or failure, increasing shame and avoidance.",
        socialMediaExplanation: "Perfectionism says if it is not excellent, it does not count."
      },
      {
        name: "Exposure to Imperfection",
        category: "Behavioral",
        simpleExplanation: "Practicing small imperfect actions teaches the body that mistakes are survivable.",
        therapistExplanation: "Behavioral exposure to imperfect performance supports inhibitory learning and reduces shame-based avoidance.",
        socialMediaExplanation: "Sending the good-enough email is nervous system practice."
      },
      {
        name: "Conditional Worth",
        category: "CBT",
        simpleExplanation: "The person believes they are worthy only when they perform well.",
        therapistExplanation: "Conditional self-worth links acceptance to achievement, approval, or flawlessness, increasing anxiety and self-criticism.",
        socialMediaExplanation: "Perfectionism often whispers: be impressive, then you can be safe."
      },
      {
        name: "Self-Compassion",
        category: "DBT",
        simpleExplanation: "Self-compassion helps people stay accountable without attacking themselves.",
        therapistExplanation: "Compassionate self-correction reduces shame and supports flexible behavior change more effectively than punitive self-talk.",
        socialMediaExplanation: "You can hold yourself accountable without making one mistake your whole identity."
      }
    ]
  },
  {
    topicName: "Burnout",
    concepts: [
      {
        name: "Allostatic Load",
        category: "Nervous System",
        simpleExplanation: "The body carries wear and tear from chronic stress.",
        therapistExplanation: "Allostatic load describes the cumulative physiological cost of repeated adaptation to stressors without adequate recovery.",
        socialMediaExplanation: "Burnout is not one hard day. It is the cost of asking your body to keep adapting without enough repair."
      },
      {
        name: "Demand-Recovery Imbalance",
        category: "Behavioral",
        simpleExplanation: "Burnout grows when demands stay high and recovery stays too low.",
        therapistExplanation: "Recovery requires reducing demands, increasing support, and creating conditions where rest can actually restore capacity.",
        socialMediaExplanation: "Rest will not feel restful if you keep returning to the same impossible load."
      },
      {
        name: "Emotional Exhaustion",
        category: "Nervous System",
        simpleExplanation: "The person has less emotional capacity because the system has been overused.",
        therapistExplanation: "Emotional exhaustion can reduce empathy, patience, motivation, and cognitive flexibility.",
        socialMediaExplanation: "When every small request feels like too much, your system may be depleted, not dramatic."
      },
      {
        name: "Values Clarification",
        category: "Behavioral",
        simpleExplanation: "This helps people decide what matters enough to keep, pause, delegate, or release.",
        therapistExplanation: "Values clarification supports choices aligned with meaning rather than fear, guilt, or automatic overfunctioning.",
        socialMediaExplanation: "Burnout recovery asks: what actually has to be carried by you, right now?"
      }
    ]
  },
  {
    topicName: "High Functioning Anxiety",
    concepts: [
      {
        name: "Intolerance of Uncertainty",
        category: "CBT",
        simpleExplanation: "Uncertainty feels threatening, so the person tries to control or predict everything.",
        therapistExplanation: "Intolerance of uncertainty drives checking, overpreparing, reassurance seeking, and difficulty resting without certainty.",
        socialMediaExplanation: "If your brain needs a backup plan for the backup plan, uncertainty may feel unsafe."
      },
      {
        name: "Overfunctioning",
        category: "Behavioral",
        simpleExplanation: "The person does more than their share to manage anxiety or prevent disappointment.",
        therapistExplanation: "Overfunctioning can preserve external stability while reinforcing internal pressure and relational imbalance.",
        socialMediaExplanation: "Being the reliable one can become lonely when nobody sees what it costs."
      },
      {
        name: "Somatic Anxiety",
        category: "Nervous System",
        simpleExplanation: "Anxiety shows up in the body even when the person looks calm.",
        therapistExplanation: "Physiological arousal can persist beneath high achievement, organization, and socially rewarded functioning.",
        socialMediaExplanation: "You can look composed and still have a nervous system running a threat scan."
      },
      {
        name: "Cognitive Overcontrol",
        category: "CBT",
        simpleExplanation: "The person tries to think, plan, or prepare their way into feeling safe.",
        therapistExplanation: "Cognitive overcontrol can reduce flexibility and increase anxiety when life remains unpredictable.",
        socialMediaExplanation: "Sometimes planning is helpful. Sometimes it is anxiety asking for certainty life cannot give."
      }
    ]
  },
  {
    topicName: "ADHD in Women",
    concepts: [
      {
        name: "Executive Dysfunction",
        category: "ADHD",
        simpleExplanation: "The brain struggles to start, organize, prioritize, or switch tasks.",
        therapistExplanation: "Executive dysfunction affects initiation, working memory, planning, inhibition, time awareness, and sustained attention.",
        socialMediaExplanation: "Caring about the task does not always make starting it accessible."
      },
      {
        name: "Time Blindness",
        category: "ADHD",
        simpleExplanation: "Time is hard to feel, estimate, or manage.",
        therapistExplanation: "Time blindness can impair task planning, transitions, punctuality, and realistic estimation of effort.",
        socialMediaExplanation: "Leaving the house is not one task when your brain has to manually track every invisible step."
      },
      {
        name: "Rejection Sensitivity",
        category: "ADHD",
        simpleExplanation: "Perceived rejection or criticism can feel intense and hard to shake.",
        therapistExplanation: "Rejection sensitivity can amplify emotional responses to feedback, exclusion, tone, or perceived disappointment.",
        socialMediaExplanation: "A neutral comment can hit like rejection when your nervous system is already braced for criticism."
      },
      {
        name: "Masking",
        category: "ADHD",
        simpleExplanation: "The person works hard to hide symptoms and appear okay.",
        therapistExplanation: "Masking can reduce visible impairment while increasing exhaustion, shame, and delayed support.",
        socialMediaExplanation: "ADHD in women can look like being put together in public and overwhelmed in private."
      },
      {
        name: "Body Doubling",
        category: "Behavioral",
        simpleExplanation: "Having another person present can make task initiation easier.",
        therapistExplanation: "Body doubling offers external structure, accountability, and co-regulation that can support executive function.",
        socialMediaExplanation: "Sometimes your brain does not need more shame. It needs another nervous system nearby."
      }
    ]
  },
  {
    topicName: "Trauma Responses",
    concepts: [
      {
        name: "Fight, Flight, Freeze, Fawn",
        category: "Trauma",
        simpleExplanation: "These are survival responses the body uses when it senses threat.",
        therapistExplanation: "Autonomic threat responses can mobilize defense, escape, immobilization, or appeasement depending on perceived safety and learned patterns.",
        socialMediaExplanation: "Trauma responses are not personality flaws. They are protection strategies."
      },
      {
        name: "Window of Tolerance",
        category: "Nervous System",
        simpleExplanation: "This is the zone where emotions feel manageable enough to think and respond.",
        therapistExplanation: "Trauma can narrow the window of tolerance, increasing shifts into hyperarousal or hypoarousal under stress.",
        socialMediaExplanation: "When you leave your window of tolerance, logic may be online in theory but unavailable in your body."
      },
      {
        name: "Trauma Triggers",
        category: "Trauma",
        simpleExplanation: "A reminder can make the body react as if old danger is happening now.",
        therapistExplanation: "Triggers are cues associated with prior threat that activate implicit memory, body alarm, and protective responses.",
        socialMediaExplanation: "Your body may be reacting to the reminder, not the room you are currently in."
      },
      {
        name: "Grounding",
        category: "DBT",
        simpleExplanation: "Grounding helps the body notice the present moment.",
        therapistExplanation: "Grounding uses sensory orientation, body awareness, and present-time cues to reduce dissociation or autonomic escalation.",
        socialMediaExplanation: "Grounding is not pretending everything is fine. It is helping your body locate now."
      }
    ]
  },
  {
    topicName: "Low Self Esteem",
    concepts: [
      {
        name: "Core Beliefs",
        category: "CBT",
        simpleExplanation: "Core beliefs are deep stories people carry about who they are.",
        therapistExplanation: "Negative core beliefs shape attention, interpretation, emotional response, and behavior in ways that confirm the self-story.",
        socialMediaExplanation: "A harsh thought can feel true because it is familiar, not because it is accurate."
      },
      {
        name: "Confirmation Bias",
        category: "CBT",
        simpleExplanation: "The brain notices evidence that matches what it already believes.",
        therapistExplanation: "Confirmation bias can lead clients to dismiss praise and overvalue criticism when it matches a negative self-schema.",
        socialMediaExplanation: "Low self-esteem can make one criticism feel more believable than ten kind comments."
      },
      {
        name: "Self-Compassion",
        category: "DBT",
        simpleExplanation: "Self-compassion means responding to pain without attacking yourself.",
        therapistExplanation: "Self-compassion supports emotional regulation, repair, accountability, and more accurate self-appraisal.",
        socialMediaExplanation: "You may not need louder confidence. You may need a less cruel narrator."
      },
      {
        name: "Behavioral Experiments",
        category: "Behavioral",
        simpleExplanation: "A small action tests whether the old self-story is fully true.",
        therapistExplanation: "Behavioral experiments create corrective experiences that challenge rigid beliefs through lived evidence.",
        socialMediaExplanation: "Apply anyway. Ask anyway. Let your life gather evidence your fear would never volunteer."
      }
    ]
  },
  {
    topicName: "Emotional Avoidance",
    concepts: [
      {
        name: "Experiential Avoidance",
        category: "Behavioral",
        simpleExplanation: "The person avoids feelings, memories, or body sensations because they seem too uncomfortable.",
        therapistExplanation: "Experiential avoidance reduces distress short term while limiting emotional processing, values-based action, and tolerance of internal experience.",
        socialMediaExplanation: "Avoiding the feeling can work for tonight and make the feeling louder next week."
      },
      {
        name: "Intellectualizing",
        category: "Trauma",
        simpleExplanation: "The person explains the feeling instead of feeling it.",
        therapistExplanation: "Intellectualization creates cognitive distance from emotion and may protect against vulnerability or overwhelm.",
        socialMediaExplanation: "You can understand your pain like a case study and still be avoiding the grief underneath."
      },
      {
        name: "Distress Tolerance",
        category: "DBT",
        simpleExplanation: "Distress tolerance helps people survive emotions without making things worse.",
        therapistExplanation: "DBT distress tolerance skills support short-term emotional endurance, crisis stabilization, and reduced impulsive avoidance.",
        socialMediaExplanation: "The goal is not to force a breakthrough. It is to tolerate two honest minutes without numbing."
      },
      {
        name: "Somatic Awareness",
        category: "Nervous System",
        simpleExplanation: "This means noticing body sensations as part of emotional awareness.",
        therapistExplanation: "Somatic awareness can help clients identify early cues of emotion, stress, dissociation, or avoidance.",
        socialMediaExplanation: "Before naming the feeling, try naming the body cue: tight chest, heavy throat, buzzing hands."
      }
    ]
  }
];

export function getRelevantPsychologyConcepts(topic: string) {
  const closestTopic = findClosestTopic(topic);
  if (!closestTopic) return [];
  return TOPIC_PSYCHOLOGY_CONCEPTS.find((profile) => profile.topicName === closestTopic.topicName)?.concepts || [];
}
