import { DEFAULT_WEIGHTS } from "./scoring";

export interface WeightPreset {
  id: string;
  label: { th: string; en: string };
  description: { th: string; en: string };
  targetWeight: number;
  weights: Record<string, number>;
}

export const PRESETS: WeightPreset[] = [
  {
    id: "manufacturing",
    label: { th: "โรงงาน / Automation", en: "Manufacturing / Automation" },
    description: {
      th: "PLC, robotics, embedded, vision — สำหรับงานโรงงานและระบบอัตโนมัติ",
      en: "PLC, robotics, embedded, vision — factory and industrial automation roles",
    },
    targetWeight: 48,
    weights: DEFAULT_WEIGHTS,
  },
  {
    id: "software-ops",
    label: { th: "Software Ops / DevOps", en: "Software Ops / DevOps" },
    description: {
      th: "Kubernetes, CI/CD, IaC, observability — สำหรับงาน DevOps/SRE/Cloud/Platform",
      en: "Kubernetes, CI/CD, IaC, observability — DevOps, SRE, cloud and platform roles",
    },
    targetWeight: 70,
    weights: {
      kubernetes: 10,
      docker: 7,
      terraform: 9,
      ansible: 7,
      "ci/cd": 8,
      jenkins: 6,
      gitlab: 6,
      aws: 8,
      azure: 7,
      gcp: 7,
      linux: 6,
      python: 5,
      bash: 4,
      prometheus: 6,
      grafana: 5,
      observability: 6,
      sre: 9,
      devops: 10,
      pipeline: 4,
      helm: 6,
      argocd: 6,
      "infrastructure as code": 9,
      openshift: 6,
      kafka: 4,
      elastic: 4,
      nginx: 3,
      monitoring: 4,
      automation: 3,
      cloud: 3,
      microservices: 3,
      api: 2,
    },
  },
];

export function getPreset(id: string): WeightPreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

export function detectPreset(weights: Record<string, number>, targetWeight: number): string {
  for (const preset of PRESETS) {
    const sameTarget = preset.targetWeight === targetWeight;
    const keys = new Set([...Object.keys(preset.weights), ...Object.keys(weights)]);
    let sameWeights = true;
    for (const key of keys) {
      if ((preset.weights[key] ?? 0) !== (weights[key] ?? 0)) {
        sameWeights = false;
        break;
      }
    }
    if (sameTarget && sameWeights) return preset.id;
  }
  return "custom";
}
