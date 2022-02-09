import React from 'react';
import {
  Text,
  TextContent,
  TextVariants,
  Stack,
  StackItem,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';
import StaticIpViewSelection from './staticIpConfigTypeSelection';
import StaticIpYamlView from './StaticIpYamlView';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import { StaticIpNetworkWideConfigurations } from './StaticIpNetworkWideConfigurations';
import { StaticIpHostSpecificConfigurations } from './StaticIpHostSpecificConfigurations';
import { StaticIpValues, StaticIpView } from '../../../services';
import { LoadingState } from '../../../../common';
import { useFormikContext } from 'formik';
import StaticIpDataService from '../../../services/StaticIpDataService';

const isoRegenerationAlert = (
  <Alert
    variant={AlertVariant.warning}
    isInline={true}
    data-testid="regenerate-iso-alert"
    title="To add new hosts that will use the new or edited configurations, you'll need to regenerate the
  Discovery ISO in the 'Host discovery' step and boot your new hosts from it."
  ></Alert>
);

export const StaticIpForm: React.FC<{ showRegenerateIsoWarning: boolean }> = ({
  showRegenerateIsoWarning,
}) => {
  const { currentStepId, onUpdateStaticIpView } = useClusterWizardContext();
  const { setFieldValue, values } = useFormikContext<StaticIpValues>();
  const onChangeView = (view: StaticIpView) => {
    setFieldValue('formData', StaticIpDataService.getEmptyFormData());
    setFieldValue('yamlData', StaticIpDataService.getEmptyYamlData());
    onUpdateStaticIpView(view);
  };

  const getCurrentView = () => {
    if (values.configType === StaticIpView.YAML) {
      return <StaticIpYamlView />;
    }
    if (values.configType === StaticIpView.FORM) {
      return currentStepId === 'static-ip-host-configurations' ? (
        <StaticIpHostSpecificConfigurations />
      ) : (
        <StaticIpNetworkWideConfigurations />
      );
    }
    return <LoadingState />;
  };
  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.h2}>Static network configurations</Text>
          <Text component={TextVariants.small}>
            Network configuration can be done using either the form view or YAML view.
            Configurations done in this step are for discovering hosts.
          </Text>
        </TextContent>
      </StackItem>
      {showRegenerateIsoWarning && <StackItem>{isoRegenerationAlert}</StackItem>}
      <StackItem>
        <StaticIpViewSelection onChangeView={onChangeView} />
      </StackItem>
      <StackItem>{getCurrentView()}</StackItem>
    </Stack>
  );
};
