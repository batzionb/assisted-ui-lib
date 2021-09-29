import { AgentStatus } from './status';
import { Host } from '../../../common';
import { AgentK8sResource } from '../../types';
import { getAgentStatus } from './status';

const AGENT_FOR_SELECTION_STATUSES: AgentStatus[] = [
  'known',
  'known-unbound',
  'insufficient',
  'insufficient-unbound',
  'pending-for-input',
];

export const hostToAgent = (agents: AgentK8sResource[] = [], host: Host) =>
  agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;

export const getAgentsForSelection = (agents: AgentK8sResource[]) =>
  agents.filter((agent) => {
    const [status] = getAgentStatus(agent);
    return AGENT_FOR_SELECTION_STATUSES.includes(status);
  });

export const getAgentRole = (agent: AgentK8sResource) => agent.spec.role || agent.status?.role;
