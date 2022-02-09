import React from 'react';
import { ButtonVariant, Form, FormGroup } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../../../../common';
import './staticIp.css';
import { StaticIpView } from '../../../services';
import { BooleanSchema } from 'yup';
import ConfirmationModal from '../../../../common/components/ui/ConfirmationModal';
import { useField } from 'formik';

export type StaticIpConfigTypeSelectionProps = {
  onChangeView: (view: StaticIpView) => void;
};

const StaticIpConfigTypeSelection: React.FC<StaticIpConfigTypeSelectionProps> = ({
  onChangeView,
}) => {
  const GROUP_NAME = 'configType';
  const [openConfirmModal, setConfirmModal] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<StaticIpView>(StaticIpView.FORM);

  const [, , { setValue }] = useField(GROUP_NAME);

  const [yamlViewField, , { setValue: setYamlField }] = useField({
    name: GROUP_NAME,
    value: StaticIpView.YAML,
    type: 'radio',
  });

  const getCurrentViewText = () => {
    return yamlViewField.checked ? 'YAML' : 'form';
  };

  const onClickFormView = (checked: boolean) => {
    if (checked) {
      setSelectedView(StaticIpView.FORM);
      setConfirmModal(true);
    }
  };
  const onClickYamlView = (checked: boolean) => {
    if (checked) {
      setSelectedView(StaticIpView.YAML);
      setConfirmModal(true);
    }
  };

  const onConfirm = () => {
    setValue(selectedView);
    setConfirmModal(false);
    onChangeView(selectedView);
  };

  return (
    <Form isHorizontal>
      <FormGroup
        fieldId={getFieldId(GROUP_NAME, 'radio')}
        isInline
        label="Configure via :"
        className="static-config-type-label"
      >
        <RadioField
          label="Form view"
          name={GROUP_NAME}
          value={StaticIpView.FORM}
          onChange={onClickFormView}
          data-testid="select-form-view"
          callFormikOnChange={false}
        />
        <RadioField
          label="YAML view"
          name={GROUP_NAME}
          value={StaticIpView.YAML}
          onChange={onClickYamlView}
          data-testid="select-yaml-view"
          callFormikOnChange={false}
        />
      </FormGroup>
      {openConfirmModal && (
        <ConfirmationModal
          title={'Change configuration option?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={
            <>
              <p>{`All data and configuration done in ${getCurrentViewText()} view will be lost.`}</p>
            </>
          }
          onClose={() => setConfirmModal(false)}
          onConfirm={onConfirm}
        />
      )}
    </Form>
  );
};

export default StaticIpConfigTypeSelection;
