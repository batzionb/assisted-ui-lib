import React from 'react';
import { ListManifestsExtended } from '../data/dataTypes';
import { CustomManifestsFormProps, CustomManifestFormState } from './propTypes';
import { getFormViewManifestsValidationSchema } from './customManifestsValidationSchema';
import { CustomManifestsForm } from './CustomManifestsForm';
import { getEmptyFormViewManifestsValues, getFormViewManifestValues } from './utils';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const CustomManifests = ({
  cluster,
  onFormStateChange,
}: {
  cluster: Cluster;
  onFormStateChange: (formState: CustomManifestFormState) => void;
}) => {
  const [formProps, setFormProps] = React.useState<CustomManifestsFormProps>();

  React.useEffect(() => {
    setFormProps({
      onFormStateChange: onFormStateChange,
      validationSchema: getFormViewManifestsValidationSchema,

      getInitialValues: (customManifests: ListManifestsExtended) => {
        return getFormViewManifestValues(customManifests);
      },
      getEmptyValues: () => getEmptyFormViewManifestsValues(),
      showEmptyValues: true,
      cluster: cluster,
    });
  }, [cluster, onFormStateChange]);

  if (!formProps) {
    return null;
  }

  return <CustomManifestsForm {...formProps} />;
};
