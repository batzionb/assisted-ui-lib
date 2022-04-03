import React from 'react';
import { Cluster, InfraEnv, InfraEnvUpdateParams, LoadingState } from '../../../common';
import NetworkConfigurationForm from '../clusterConfiguration/NetworkConfigurationForm';
import ReviewStep from '../clusterConfiguration/ReviewStep';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterDetails from './ClusterDetails';
import HostDiscovery from './HostDiscovery';
import StaticIp from './StaticIp';
import classNames from 'classnames';
import './wizard.css';
type ClusterWizardProps = {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster, infraEnv, updateInfraEnv }) => {
  const { currentStepId } = useClusterWizardContext();

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'host-discovery':
        return <HostDiscovery cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationForm cluster={cluster} />;
      case 'review':
        return <ReviewStep cluster={cluster} />;
      case 'static-ip-host-configurations':
      case 'static-ip-network-wide-configurations':
      case 'static-ip':
        return <StaticIp cluster={cluster} infraEnv={infraEnv} updateInfraEnv={updateInfraEnv} />;
      case 'cluster-details':
      default:
        return <ClusterDetails cluster={cluster} infraEnv={infraEnv} />;
    }
  }, [currentStepId, cluster, infraEnv, updateInfraEnv]);
  if (!currentStepId) {
    return <LoadingState />;
  }
  return (
    <div className={classNames('pf-c-wizard', 'cluster-wizard', 'ocm-wizard')}>
      {renderCurrentStep()}
    </div>
  );
};

export default ClusterWizard;
