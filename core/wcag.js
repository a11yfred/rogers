/**
 * WCAG 2.x success criteria — A and AA only.
 * Each entry: { sc, title, level, version, note? }
 */
export const WCAG_CRITERIA = [
  // 1.1 Text Alternatives
  { sc: '1.1.1', title: 'Non-text Content',                                          level: 'A',  version: '2.0' },
  // 1.2 Time-based Media
  { sc: '1.2.1', title: 'Audio-only and Video-only (Prerecorded)',                   level: 'A',  version: '2.0' },
  { sc: '1.2.2', title: 'Captions (Prerecorded)',                                    level: 'A',  version: '2.0' },
  { sc: '1.2.3', title: 'Audio Description or Media Alternative (Prerecorded)',      level: 'A',  version: '2.0' },
  { sc: '1.2.4', title: 'Captions (Live)',                                           level: 'AA', version: '2.0' },
  { sc: '1.2.5', title: 'Audio Description (Prerecorded)',                           level: 'AA', version: '2.0' },
  // 1.3 Adaptable
  { sc: '1.3.1', title: 'Info and Relationships',                                    level: 'A',  version: '2.0' },
  { sc: '1.3.2', title: 'Meaningful Sequence',                                       level: 'A',  version: '2.0' },
  { sc: '1.3.3', title: 'Sensory Characteristics',                                   level: 'A',  version: '2.0' },
  { sc: '1.3.4', title: 'Orientation',                                               level: 'A',  version: '2.1' },
  { sc: '1.3.5', title: 'Identify Input Purpose',                                    level: 'AA', version: '2.1' },
  // 1.4 Distinguishable
  { sc: '1.4.1', title: 'Use of Color',                                              level: 'A',  version: '2.0' },
  { sc: '1.4.2', title: 'Audio Control',                                             level: 'A',  version: '2.0' },
  { sc: '1.4.3', title: 'Contrast (Minimum)',                                        level: 'AA', version: '2.0' },
  { sc: '1.4.4', title: 'Resize Text',                                               level: 'AA', version: '2.0' },
  { sc: '1.4.5', title: 'Images of Text',                                            level: 'AA', version: '2.0' },
  { sc: '1.4.10', title: 'Reflow',                                                   level: 'AA', version: '2.1' },
  { sc: '1.4.11', title: 'Non-text Contrast',                                        level: 'AA', version: '2.1' },
  { sc: '1.4.12', title: 'Text Spacing',                                             level: 'AA', version: '2.1' },
  { sc: '1.4.13', title: 'Content on Hover or Focus',                                level: 'AA', version: '2.1' },
  // 2.1 Keyboard Accessible
  { sc: '2.1.1', title: 'Keyboard',                                                  level: 'A',  version: '2.0' },
  { sc: '2.1.2', title: 'No Keyboard Trap',                                          level: 'A',  version: '2.0' },
  { sc: '2.1.4', title: 'Character Key Shortcuts',                                   level: 'A',  version: '2.1' },
  // 2.2 Enough Time
  { sc: '2.2.1', title: 'Timing Adjustable',                                         level: 'A',  version: '2.0' },
  { sc: '2.2.2', title: 'Pause, Stop, Hide',                                         level: 'A',  version: '2.0' },
  // 2.3 Seizures and Physical Reactions
  { sc: '2.3.1', title: 'Three Flashes or Below Threshold',                          level: 'A',  version: '2.0' },
  // 2.4 Navigable
  { sc: '2.4.1', title: 'Bypass Blocks',                                             level: 'A',  version: '2.0' },
  { sc: '2.4.2', title: 'Page Titled',                                               level: 'A',  version: '2.0' },
  { sc: '2.4.3', title: 'Focus Order',                                               level: 'A',  version: '2.0' },
  { sc: '2.4.4', title: 'Link Purpose (In Context)',                                 level: 'A',  version: '2.0' },
  { sc: '2.4.5', title: 'Multiple Ways',                                             level: 'AA', version: '2.0' },
  { sc: '2.4.6', title: 'Headings and Labels',                                       level: 'AA', version: '2.0' },
  { sc: '2.4.7', title: 'Focus Visible',                                             level: 'AA', version: '2.0' },
  { sc: '2.4.11', title: 'Focus Not Obscured (Minimum)',                             level: 'AA', version: '2.2' },
  // 2.5 Input Modalities
  { sc: '2.5.1', title: 'Pointer Gestures',                                          level: 'A',  version: '2.1' },
  { sc: '2.5.2', title: 'Pointer Cancellation',                                      level: 'A',  version: '2.1' },
  { sc: '2.5.3', title: 'Label in Name',                                             level: 'A',  version: '2.1' },
  { sc: '2.5.4', title: 'Motion Actuation',                                          level: 'A',  version: '2.1' },
  { sc: '2.5.7', title: 'Dragging Movements',                                        level: 'AA', version: '2.2' },
  { sc: '2.5.8', title: 'Target Size (Minimum)',                                     level: 'AA', version: '2.2' },
  // 3.1 Readable
  { sc: '3.1.1', title: 'Language of Page',                                          level: 'A',  version: '2.0' },
  { sc: '3.1.2', title: 'Language of Parts',                                         level: 'AA', version: '2.0' },
  // 3.2 Predictable
  { sc: '3.2.1', title: 'On Focus',                                                  level: 'A',  version: '2.0' },
  { sc: '3.2.2', title: 'On Input',                                                  level: 'A',  version: '2.0' },
  { sc: '3.2.3', title: 'Consistent Navigation',                                     level: 'AA', version: '2.0' },
  { sc: '3.2.4', title: 'Consistent Identification',                                 level: 'AA', version: '2.0' },
  { sc: '3.2.6', title: 'Consistent Help',                                           level: 'A',  version: '2.2' },
  // 3.3 Input Assistance
  { sc: '3.3.1', title: 'Error Identification',                                      level: 'A',  version: '2.0' },
  { sc: '3.3.2', title: 'Labels or Instructions',                                    level: 'A',  version: '2.0' },
  { sc: '3.3.3', title: 'Error Suggestion',                                          level: 'AA', version: '2.0' },
  { sc: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)',                 level: 'AA', version: '2.0' },
  { sc: '3.3.7', title: 'Redundant Entry',                                           level: 'A',  version: '2.2' },
  { sc: '3.3.8', title: 'Accessible Authentication (Minimum)',                       level: 'AA', version: '2.2' },
  // 4.1 Compatible
  { sc: '4.1.1', title: 'Parsing',                                                   level: 'A',  version: '2.0', note: 'Obsolete in 2.2' },
  { sc: '4.1.2', title: 'Name, Role, Value',                                         level: 'A',  version: '2.0' },
  { sc: '4.1.3', title: 'Status Messages',                                           level: 'AA', version: '2.1' },
]

const SC_SET = new Set(WCAG_CRITERIA.map(c => c.sc))

/** Returns true if the given SC number exists in WCAG 2.x A/AA criteria */
export function isValidSC(sc) {
  return SC_SET.has(sc)
}
