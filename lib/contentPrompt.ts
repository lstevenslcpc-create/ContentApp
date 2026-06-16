import type { ContentAngle } from "./contentAngles";
import type { FrameworkBrief } from "./psychologyFrameworkEngine";
import type { ExampleBrief } from "./realLifeExampleEngine";
import type { TherapistInsightBrief } from "./therapistInsightEngine";
import type { TherapistObservationBrief } from "./therapistObservationEngine";
import type { BrandBrain, BusinessProfile, ContentGenerationRequest, ContentIntelligenceBrief } from "./types";
import { formatBrandBrainForPrompt } from "./brandBrain/format";
import { formatContentGoalForPrompt } from "./contentGoalConfig";

function followerGrowthInstructions(request: ContentGenerationRequest) {
  if (request.contentGoal !== "follower-growth") return "";

  return `
Follower-growth rules:
- Write for relatability, saves, shares, comments, and follows before therapy/service promotion.
- Hooks must be emotionally specific and social-native. Name the tiny moment, inner dialogue, body reaction, or relationship cue.
- Bad hook style: "Does it feel like your relationships are a constant source of stress?"
- Good hook style: "When their tone changes and your whole body starts looking for what went wrong"
- Use this CTA family when it fits naturally:
  - "save this if it felt familiar"
  - "send this to someone who overthinks every tone shift"
  - "follow @LHtherapy for emotionally honest mental health content"
- Use at least one of those follower-growth CTAs verbatim, and prefer two when the caption has room.
- Do not use salesy or generic clinical phrases for follower-growth, including "discover practical tools", "nurture secure relationships", or "explore therapy options".
- Also avoid generic wellness filler such as "does this sound familiar", "you are not alone", "take a moment to pause and breathe", "mental health matters", or broad hashtags like "#MentalHealthMatters".
- Captions should stay anchored in the same specific moment as the hook. Use concrete examples, inner dialogue, body cues, and one gentle reframe before the CTA.
- Hashtags should be niche-specific and topic-specific, not broad awareness filler.
- Keep the voice emotionally intelligent, warm, relatable, trauma-informed, non-generic, social-native, and not salesy.
- For Instagram carousel content, include a stronger hook, carousel slide idea, caption, hashtags, and suggested Canva template in the generated fields.
- If topic is anxious attachment, aim for the emotional specificity of: "When their tone changes and your whole body starts looking for what went wrong."
`;
}

function formatResearchBriefForPrompt(brief?: ContentIntelligenceBrief | null) {
  if (!brief) return "";

  return `
Content Research + Depth Brief:
- Primary content angle: ${brief.content_angle || "Use the assigned planned angle for each post."}
- Selected framework: ${brief.selectedFramework || "Use the assigned psychology framework for each post."}
- Why this framework fits: ${brief.whyThisFrameworkFits || "Framework selected per post."}
- Framework explanation: ${brief.frameworkExplanation || "Teach through the selected framework."}
- Practical application: ${brief.practicalApplication || "Give one grounded next step through the selected framework."}
- Thoughts: ${(brief.thoughts || []).join(" | ") || "Use the assigned example brief."}
- Emotions: ${(brief.emotions || []).join(" | ") || "Use the assigned example brief."}
- Behaviors: ${(brief.behaviors || []).join(" | ") || "Use the assigned example brief."}
- Body signs: ${(brief.bodySigns || []).join(" | ") || "Use the assigned example brief."}
- What this can look like: ${(brief.whatThisCanLookLike || []).join(" | ") || "Use the assigned example brief."}
- Therapist insight: ${brief.therapistInsight || "Use the assigned therapist insight brief."}
- Therapist observation: ${brief.therapistObservation?.whatISeeInTherapy || "Use the assigned therapist observation brief."}
- Common assumption to correct: ${brief.therapistObservation?.commonMisunderstanding || "Use the assigned therapist observation brief."}
- Hidden emotion underneath behavior: ${brief.therapistObservation?.hiddenEmotionUnderneathBehavior || "Use the assigned therapist observation brief."}
- Internal belief driving behavior: ${brief.therapistObservation?.internalBeliefDrivingBehavior || "Use the assigned therapist observation brief."}
- What others usually assume: ${brief.therapistObservation?.whatOthersUsuallyAssume || "Use the assigned therapist observation brief."}
- What is actually happening psychologically: ${brief.therapistObservation?.whatIsActuallyHappeningPsychologically || "Use the assigned therapist observation brief."}
- Therapist reframe: ${brief.therapistObservation?.therapistReframe || "Use the assigned therapist observation brief."}
- Practical everyday example: ${brief.therapistObservation?.practicalEverydayExample || "Use the assigned therapist observation brief."}
- Common misunderstanding: ${brief.commonMisunderstanding || "Use the assigned therapist insight brief."}
- What people often miss: ${brief.whatPeopleOftenMiss || "Use the assigned therapist insight brief."}
- What parents, partners, or clients need to know: ${brief.whatToKnow || "Use the assigned therapist insight brief."}
- What not to say: ${(brief.whatNotToSay || []).join(" | ") || "Use the assigned therapist insight brief."}
- What to try instead: ${(brief.whatToTryInstead || []).join(" | ") || "Use the assigned therapist insight brief."}
- Clinical nuance: ${brief.clinicalNuance || "Use the assigned therapist insight brief."}
- LionHeart style note: ${brief.LionHeartStyleNote || "Therapist-led, emotionally specific, practical, warm, and non-generic."}
- Topic definition: ${brief.topic_definition}
- Psychological explanation: ${brief.psychological_explanation}
- Common symptoms: ${brief.common_symptoms.join(", ")}
- Hidden or less obvious signs: ${brief.hidden_signs.join(", ")}
- Emotional experience: ${brief.emotional_experience}
- Real-life examples: ${brief.real_life_examples.join(" | ")}
- Behavioral patterns: ${brief.behavioral_patterns.join(", ")}
- Nervous system or body-based signs: ${brief.nervous_system_signs.join(", ")}
- Common myths or misunderstandings: ${brief.common_myths.join(" | ")}
- What a therapist would want people to understand: ${brief.therapist_insight}
- What parents, partners, or clients may notice: ${brief.observer_notes}
- Practical takeaway: ${brief.practical_takeaway}
- Best-fit CTA based on content goal: ${brief.best_fit_cta}
- Audience insight: ${brief.audience_insight}
- Psychological angle: ${brief.psychological_angle}
- CTA strategy: ${brief.cta_strategy}
- Suggested template: ${brief.suggested_template}
- Source notes: ${(brief.source_notes || []).join(" | ") || "Built-in clinical knowledge brief. Web research not enabled."}

Use this brief as mandatory source context. The final post should feel researched, therapist-led, emotionally specific, and differentiated by the content goal.
`;
}

function formatPlannedAnglesForPrompt(angles: ContentAngle[] = []) {
  if (!angles.length) return "";
  return `
Required Content Angles:
${angles.map((angle, index) => `Post ${index + 1}: ${angle.name}
- Angle description: ${angle.description}
- Hook direction: ${angle.hookDirection}`).join("\n")}

Each generated post must use its assigned content angle exactly. Do not blend all angles into one generic post.
`;
}

function formatFrameworkBriefsForPrompt(frameworkBriefs: FrameworkBrief[] = []) {
  if (!frameworkBriefs.length) return "";
  return `
Required Psychology Frameworks:
${frameworkBriefs.map((brief, index) => `Post ${index + 1}: ${brief.selectedFramework}
- Why this framework fits: ${brief.whyThisFrameworkFits}
- Framework explanation: ${brief.frameworkExplanation}
- Practical application: ${brief.practicalApplication}`).join("\n")}

Every post must teach through its assigned framework. Do not only name symptoms or make relatable statements.
`;
}

function formatExampleBriefsForPrompt(exampleBriefs: ExampleBrief[] = []) {
  if (!exampleBriefs.length) return "";
  return `
Required Real-Life Example Briefs:
${exampleBriefs.map((brief, index) => `Post ${index + 1}:
- Thoughts: ${brief.thoughts.join(" | ") || "none"}
- Emotions: ${brief.emotions.join(" | ") || "none"}
- Behaviors: ${brief.behaviors.join(" | ") || "none"}
- Body signs: ${brief.bodySigns.join(" | ") || "none"}
- Real-life examples: ${brief.realLifeExamples.join(" | ") || "none"}
- What this can look like: ${brief.whatThisCanLookLike.join(" | ") || "none"}`).join("\n")}

Every post must include at least one specific real-life example from its assigned example brief unless the content type truly cannot support examples.
`;
}

function formatTherapistInsightBriefsForPrompt(insightBriefs: TherapistInsightBrief[] = []) {
  if (!insightBriefs.length) return "";
  return `
Required Therapist Insight Briefs:
${insightBriefs.map((brief, index) => `Post ${index + 1}:
- Therapist observation: ${brief.therapistInsight}
- Common misunderstanding: ${brief.commonMisunderstanding}
- What people often miss: ${brief.whatPeopleOftenMiss}
- What parents, partners, or clients need to know: ${brief.whatToKnow}
- What not to say: ${brief.whatNotToSay.join(" | ")}
- What to try instead: ${brief.whatToTryInstead.join(" | ")}
- Clinical nuance: ${brief.clinicalNuance}
- LionHeart style note: ${brief.LionHeartStyleNote}`).join("\n")}

Every post must sound therapist-led, emotionally specific, practical, warm, and non-generic. Use the assigned therapist observation to shape the caption.
`;
}

function formatTherapistObservationBriefsForPrompt(observationBriefs: TherapistObservationBrief[] = []) {
  if (!observationBriefs.length) return "";
  return `
Required Therapist Observation Briefs:
${observationBriefs.map((brief, index) => `Post ${index + 1}:
- What I see in therapy: ${brief.whatISeeInTherapy}
- Common misunderstanding: ${brief.commonMisunderstanding}
- Hidden emotion underneath behavior: ${brief.hiddenEmotionUnderneathBehavior}
- Internal belief driving behavior: ${brief.internalBeliefDrivingBehavior}
- What parents, partners, friends, or others usually assume: ${brief.whatOthersUsuallyAssume}
- What is actually happening psychologically: ${brief.whatIsActuallyHappeningPsychologically}
- Therapist reframe: ${brief.therapistReframe}
- Practical example from everyday life: ${brief.practicalEverydayExample}
- Preferred observation lead-in: ${brief.observationLeadIn}`).join("\n")}

Every post must include at least one authentic therapist observation from its assigned observation brief. Prefer phrases like "What I see in therapy...", "Many people assume...", "What is actually happening...", or "One thing people rarely realize...".
`;
}

export function buildContentPrompt(profile: BusinessProfile, request: ContentGenerationRequest, brandBrain?: BrandBrain | null, researchBrief?: ContentIntelligenceBrief | null, plannedAngles: ContentAngle[] = [], frameworkBriefs: FrameworkBrief[] = [], exampleBriefs: ExampleBrief[] = [], therapistInsightBriefs: TherapistInsightBrief[] = [], therapistObservationBriefs: TherapistObservationBrief[] = []) {
  return `
You are an expert small-business content strategist. Generate ${request.numberOfPosts} ready-to-review ${request.contentType} idea(s) for ${request.platform}.

Business:
- Name: ${profile.business_name}
- Industry: ${profile.industry || "Not provided"}
- Services: ${profile.services_offered || "Not provided"}
- Target audience: ${profile.target_audience || "Not provided"}
- Location served: ${profile.location_served || "Not provided"}
- Brand voice: ${profile.brand_voice || "clear, helpful, credible"}
- Main goal: ${profile.main_goal || request.contentGoal}
- Offer/promotion: ${profile.offer_promotion || "None"}
- Preferred CTA: ${profile.call_to_action || "Contact us today"}

Primary content topic: ${request.topic}
Content goal: ${request.contentGoal}
${formatContentGoalForPrompt(request.contentGoal)}
${followerGrowthInstructions(request)}
${formatResearchBriefForPrompt(researchBrief)}
${formatPlannedAnglesForPrompt(plannedAngles)}
${formatFrameworkBriefsForPrompt(frameworkBriefs)}
${formatExampleBriefsForPrompt(exampleBriefs)}
${formatTherapistInsightBriefsForPrompt(therapistInsightBriefs)}
${formatTherapistObservationBriefsForPrompt(therapistObservationBriefs)}

${request.intelligenceBrief ? `
Saved Content Opportunity Brief:
- Topic: ${request.intelligenceBrief.topic}
- Audience: ${request.intelligenceBrief.audience}
- Content pillar: ${request.intelligenceBrief.content_pillar}
- SEO keywords: ${request.intelligenceBrief.seo_keywords.join(", ")}
- Emotional angle: ${request.intelligenceBrief.emotional_angle}
- Strongest hook: ${request.intelligenceBrief.strongest_emotional_hook || "Not provided"}
- Curiosity angle: ${request.intelligenceBrief.curiosity_angle || "Not provided"}
- Save-worthy angle: ${request.intelligenceBrief.save_worthy_angle || "Not provided"}
- Share-worthy angle: ${request.intelligenceBrief.share_worthy_angle || "Not provided"}
- Emotional trigger category: ${request.intelligenceBrief.emotional_trigger_category || "Not provided"}
- Visual direction: ${request.intelligenceBrief.visual_direction || "Not provided"}
- Product tie-in: ${request.intelligenceBrief.product_tie_in || "None"}
- Service tie-in: ${request.intelligenceBrief.service_tie_in || "None"}
- Required CTA direction: ${request.intelligenceBrief.cta}
- Clinical sensitivity: ${request.intelligenceBrief.clinical_sensitivity}

Build the content pack around this brief. Keep each post distinct, but make the whole pack feel like a strategic campaign.
` : ""}

${formatBrandBrainForPrompt(brandBrain)}

Content rules:
- Make outputs feel deeply customized to ${brandBrain?.brand_name || profile.business_name}, never generic wellness AI.
- Write from the Content Research + Depth Brief before writing the final post.
- Include specific symptoms, emotions, body cues, behaviors, myths, real-life examples, and therapist-level insight when relevant.
- Do not flatten the topic into broad mental health education. Name the exact moment, body response, relationship cue, parent-child example, or hidden behavior.
- Hooks must pull from the brief's real-life examples, hidden signs, nervous system signs, or observer notes. Do not write broad reassurance hooks.
- Avoid generic openers such as "you are not alone", "does this sound familiar", "many people struggle with", "it is okay to", or "mental health matters".
- Use the Brand Brain's audience profiles, therapy services, product catalog, SEO priorities, safety rules, visual identity, and CTA preferences.
- Do not use forbidden AI phrases or generic therapy clichés.
- Avoid em dashes completely. Do not use — in any generated content. Replace em dashes with periods, commas, colons, or shorter sentences.
- Avoid diagnostic certainty, crisis-baiting, fear-based urgency, guaranteed outcomes, and graphic trauma details.
- Include clinical nuance and a gentle review-before-posting mindset.
- Canva visual directions must follow the Brand Brain visual rules.
- Let the selected content goal guide the hook style, CTA style, and Canva/template recommendation.
- Let the primary topic guide the emotional angle, examples, hook wording, SEO language, visual direction, and template recommendation.
- Include the recommended Canva/template direction inside visual_idea so it can be used during design prep.
- For follower-growth, keep service or therapy promotion secondary unless the user explicitly selected leads or therapy-inquiries.
- For follower-growth, captions should feel like a therapist creator naming a familiar emotional pattern, then inviting saves, shares, comments, or follows.
- For trust-building, use psychoeducation plus real-life examples so the audience thinks, "This therapist gets it." Avoid product selling.
- For trust-building, start with a concrete observation such as irritability after school, "I am fine" behavior, stomach aches before school, tone scanning, avoidance, perfectionism, or reassurance seeking. Then explain what may be happening underneath.
- For education, teach what this means, why it happens, and what helps.
- For saves, use signs, scripts, steps, checklists, coping tools, or frameworks.
- For shares, make the content feel easy to send to someone who needs the language.
- For leads or therapy-inquiries, softly connect the pattern to what therapy support can help with.
- For product-sales, connect pain point to product benefit and CTA clearly.
- Every post must explain the psychology behind the angle using the assigned framework. Use the framework to teach why the pattern happens, how it shows up, and what a grounded next step can look like.
- When the assigned framework combines two frameworks, explain how both fit without becoming academic.
- Do not use framework names as decoration only. The caption must actually teach through the framework.
- Every post must include at least one concrete real-life example, behavior, body sign, thought, phrase, or daily-life moment from the assigned example brief unless the selected content type truly cannot support examples.
- Prefer examples like irritability after school, stomach aches before class, avoiding homework, saying "I am fine", shutting down when asked questions, perfectionism around grades, rereading texts, checking tone changes, or overexplaining after conflict.
- Use the assigned therapist insight to avoid broad or promotional language. The post should sound like a licensed therapist naming what is happening underneath, not like AI summarizing symptoms.
- Every post must include at least one therapist observation. This can be a direct line such as "What I see in therapy...", "Many people assume...", "What is actually happening...", or "One thing people rarely realize...".
- The therapist observation must reveal something underneath the behavior: the hidden emotion, internal belief, common assumption, actual psychological process, or everyday example.
- Outputs should feel like a therapist revealing something the audience has not considered before.
- Avoid generic encouragement, "you are not alone", "mental health matters", and vague "seek support" language.
- Do not use the assigned "what not to say" language except to explain that it is unhelpful. Prefer "what to try instead" scripts when a practical phrase fits.
- Avoid promotional language unless the goal is leads, therapy-inquiries, product-sales, promotion, or email-list-growth.
- Avoid generic AI phrases including "unlock your potential", "healing journey", "just breathe", "you are enough", "mental health matters", "discover practical tools", and "nurture secure relationships".

Return strict JSON only with this shape:
{
  "posts": [
    {
      "hook": "Strong opening line. For follower-growth, make this a specific lived-moment hook, not a broad question.",
      "content_angle": "The exact assigned content angle name for this post",
      "caption": "Platform-specific caption with clear value, simple explanation, and CTA. For follower-growth, prioritize relatability, saves, shares, comments, and follows before therapy promotion. Avoid generic filler and guaranteed lead claims.",
      "hashtags": ["#Example"],
      "visual_idea": "Specific visual or Canva-ready creative direction, including suggested Canva template when relevant",
      "script": "Short script for Reels/TikTok/Shorts, or empty string for non-video formats",
      "selectedFramework": "The exact assigned framework name or framework combination",
      "whyThisFrameworkFits": "Why this framework fits the topic, angle, and goal",
      "frameworkExplanation": "Short explanation of the psychology behind the post",
      "practicalApplication": "One grounded way the audience can apply the framework",
      "thoughts": ["Specific thought patterns used in this post"],
      "emotions": ["Specific emotions used in this post"],
      "behaviors": ["Specific behaviors used in this post"],
      "bodySigns": ["Specific body signs used in this post"],
      "whatThisCanLookLike": ["Concrete daily-life examples used in this post"],
      "therapistInsight": "Therapist observation used in this post",
      "therapistObservation": {
        "whatISeeInTherapy": "The exact therapist observation included or clearly used",
        "commonMisunderstanding": "What people usually misunderstand",
        "hiddenEmotionUnderneathBehavior": "The hidden emotion underneath the behavior",
        "internalBeliefDrivingBehavior": "The belief driving the behavior",
        "whatOthersUsuallyAssume": "What parents, partners, friends, or others usually assume",
        "whatIsActuallyHappeningPsychologically": "What is actually happening psychologically",
        "therapistReframe": "Therapist reframe",
        "practicalEverydayExample": "Everyday example"
      },
      "commonMisunderstanding": "Misunderstanding this post corrects",
      "whatPeopleOftenMiss": "Subtle point people often miss",
      "whatToKnow": "What parents, partners, or clients need to know",
      "whatToTryInstead": ["Practical phrase or action to try instead"],
      "clinicalNuance": "Clinical nuance that keeps the post ethical and non-generic",
      "LionHeartStyleNote": "How this follows LionHeart's voice",
      "content_intelligence_brief_summary": "Short review summary of the topic depth used in this post",
      "why_this_works": {
        "goal_used": "${request.contentGoal}",
        "audience_insight": "Why this will feel relevant to the intended audience",
        "psychological_angle": "The clinical or emotional pattern behind the content",
        "cta_strategy": "Why the CTA fits the selected content goal",
        "suggested_template": "Best Canva/template direction",
        "selected_framework": "The selected framework",
        "framework_explanation": "How the framework teaches the post",
        "practical_application": "The practical application included",
        "therapist_insight": "The therapist insight used",
        "therapist_observation": "The therapist observation used",
        "therapist_reframe": "The therapist reframe used",
        "real_life_example_used": "The specific real-life example used",
        "quality_checklist": {
          "hookSpecific": true,
          "teachesSomething": true,
          "includesRealLifeExample": true,
          "matchesSelectedGoal": true,
          "ctaAppropriate": true,
          "avoidsGenericAiPhrases": true,
          "soundsLikeLionHeartTherapy": true
        }
      }
    }
  ]
}

Every post must be client-focused, specific to the business, clinically safe, and ready for manual posting after review. Avoid em dashes in every field.
`;
}
