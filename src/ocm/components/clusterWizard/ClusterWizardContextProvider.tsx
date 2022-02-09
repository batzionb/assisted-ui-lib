import React, { PropsWithChildren } from 'react';
import ClusterWizardContext, { ClusterWizardContextType } from './ClusterWizardContext';
import { ClusterWizardStepsType, getClusterWizardFirstStep } from './wizardTransition';
import { HostsNetworkConfigurationType, StaticIpInfo, StaticIpView } from '../../services';
import './wizard.css';
import { defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { Cluster, InfraEnv } from '../../../common/api';
import StaticIpDataService from '../../services/StaticIpDataService';

const getWizardStepIds = (staticIpView?: StaticIpView): ClusterWizardStepsType[] => {
  const stepIds: ClusterWizardStepsType[] = [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepIds.splice(1, 0, 'static-ip');
  } else if (staticIpView === StaticIpView.FORM) {
    stepIds.splice(1, 0, ...staticIpFormViewSubSteps);
  }
  return stepIds;
};

const ClusterWizardContextProvider: React.FC<PropsWithChildren<{
  cluster?: Cluster;
  infraEnv?: InfraEnv;
}>> = ({ children, cluster, infraEnv }) => {
  const staticIpInfo = React.useMemo<StaticIpInfo | null>(() => {
    if (!infraEnv) {
      return null;
    }
    return StaticIpDataService.getStaticIpInfo(infraEnv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); //this is only for getting the first step
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>(
    getClusterWizardFirstStep(staticIpInfo, cluster?.status),
  );
  const [wizardStepIds, setWizardStepIds] = React.useState<ClusterWizardStepsType[]>(
    getWizardStepIds(staticIpInfo?.view),
  );
  const contextValue = React.useMemo<ClusterWizardContextType>(() => {
    const currentStepIdx = wizardStepIds.indexOf(currentStepId);
    return {
      moveBack(): void {
        setCurrentStepId(wizardStepIds[currentStepIdx - 1]);
      },
      moveNext(): void {
        setCurrentStepId(wizardStepIds[currentStepIdx + 1]);
      },
      onUpdateStaticIpView(view: StaticIpView): void {
        setWizardStepIds(getWizardStepIds(view));
        if (view === StaticIpView.YAML) {
          setCurrentStepId('static-ip');
        } else {
          setCurrentStepId('static-ip-network-wide-configurations');
        }
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        if (type === HostsNetworkConfigurationType.STATIC) {
          setWizardStepIds(getWizardStepIds(StaticIpView.FORM));
        }
      },
      wizardStepIds,
      currentStepId,
      setCurrentStepId,
    };
  }, [wizardStepIds, currentStepId, setCurrentStepId]);
  return (
    <>
      <ClusterWizardContext.Provider value={contextValue}>{children}</ClusterWizardContext.Provider>
    </>
  );
};

export default ClusterWizardContextProvider;
