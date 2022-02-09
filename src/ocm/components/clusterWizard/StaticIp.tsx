import React, { useEffect } from 'react';
import { Formik, FormikConfig, FormikProps } from 'formik';
import {
  Cluster,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  InfraEnv,
  useAlerts,
  ErrorState,
  InfraEnvUpdateParams,
} from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { StaticIpForm } from '../clusterConfiguration/staticIp/StaticIpForm';
import {
  getStaticIpValidationSchema,
  staticIpValidationSchema,
} from '../clusterConfiguration/staticIp/staticIpValidationSchema';
import { StaticIpValues, StaticIpView } from '../../services';
import { InfraEnvsAPI } from '../../services/apis';
import StaticIpDataService from '../../services/StaticIpDataService';
import { formHostDataToYamlStr } from '../../services/StaticIpFormHostToYaml';
import { captureException } from '../../sentry';
import { isString } from 'lodash';
import StaticIpConfigTypeSelection from '../clusterConfiguration/staticIp/staticIpConfigTypeSelection';
export type StaticIpsProps = {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

const StaticIp: React.FC<StaticIpsProps> = ({ cluster, infraEnv, updateInfraEnv }) => {
  const { moveBack, moveNext, currentStepId } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [yaml, setYaml] = React.useState<string>('');
  const initialValues = React.useMemo(() => {
    const values = infraEnv.staticNetworkConfig
      ? StaticIpDataService.getStaticIpValues(infraEnv.staticNetworkConfig)
      : null;
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isStaticIpConfigured = React.useMemo(() => {
    //since there's no way to determine if the user generated an ISO or not,
    //we are checking if the static ip configuration was previously completed, and showing the regnerate ISO in this case
    return StaticIpDataService.getStaticIpInfo(infraEnv)?.isDataComplete;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validationSchema = React.useMemo(() => {
    return getStaticIpValidationSchema(currentStepId === 'static-ip-host-configurations');
  }, [currentStepId]);

  const handleUpdateError = (error?: any) => {
    let errMsg = 'Failed to update infra env';
    if (isString(error)) {
      errMsg = error;
    }
    addAlert({
      title: errMsg,
    });
    captureException(error);
  };

  const handleSubmit: FormikConfig<StaticIpValues>['onSubmit'] = async (
    values: StaticIpValues,
    { resetForm },
  ) => {
    clearAlerts();
    try {
      if (
        values.configType === StaticIpView.FORM &&
        values.formData &&
        values.formData.hostConfigurations.length > 0
      ) {
        setYaml(
          formHostDataToYamlStr(
            values.formData.networWideConfigurations,
            values.formData.hostConfigurations[0],
            'eth0',
          ),
        );
      }
      const infraEnv = await updateInfraEnv({
        staticNetworkConfig: StaticIpDataService.getStaticNetworkConfigUpdateValue(values),
      });
      if (!infraEnv.staticNetworkConfig) {
        handleUpdateError('Failed to update infra env: infra env returned empty static ip data');
        return;
      }
    } catch (err) {
      handleUpdateError(err);
      return;
    }
  };

  if (initialValues === null) {
    return <ErrorState title="Infra env doesn't contain static ip data" />;
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ isSubmitting, errors, touched }: FormikProps<StaticIpValues>) => {
        const errorFields = getFormikErrorFields(errors, touched);

        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            isNextDisabled={false}
            onNext={moveNext}
            onBack={moveBack}
          />
        );

        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation cluster={cluster} />}
            footer={footer}
          >
            <StaticIpForm showRegenerateIsoWarning={!!isStaticIpConfigured} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default StaticIp;
