import { createAsyncThunk } from '@reduxjs/toolkit';
import { CpuArchitecture, WithRequired } from '../../../../common';
import { InfraEnvsAPI } from '../../../services/apis';
import { RootStateDay1 } from '../../store-day1';
import { selectInfraEnvByCpuArchitecture } from './selectors';
import {
  Cluster,
  InfraEnv,
  InfraEnvCreateParams,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

export const listInfraEnvsByClusterId = createAsyncThunk(
  'infraEnvs/listByClusterId',
  async (clusterId: Cluster['id']) => {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
    return infraEnvs;
  },
);

export const createInfraEnv = createAsyncThunk(
  '',
  async (params: WithRequired<InfraEnvCreateParams, 'clusterId'>) => {
    const { data: infraEnv } = await InfraEnvsAPI.register(params);
    // dispatch({ type: 'currentCluster/updateStaticNetworkConfig' payload: infraEnv.staticNetworkConfig });
    return infraEnv;
  },
);

export const removeAllInfraEnvs = createAsyncThunk('infraEnvs/removeAll', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootStateDay1;
  const infraEnvIds = state.infraEnvs.map((infraEnv) => infraEnv.id);
  const promises = [];
  for (const infraEnvId of infraEnvIds) {
    promises.push(InfraEnvsAPI.deregister(infraEnvId));
  }
  return await Promise.all(promises);
});

export const updateInfraEnv = createAsyncThunk(
  'infraEnvs/update',
  async ({ infraEnvId, ...params }: InfraEnvUpdateParams & { infraEnvId: InfraEnv['id'] }) => {
    const { data: infraEnv } = await InfraEnvsAPI.update(infraEnvId, params);
    // dispatch({ type: 'currentCluster/updateStaticNetworkConfig' payload: infraEnv.staticNetworkConfig });
    return infraEnv;
  },
);

export const getImageUrl = createAsyncThunk(
  'infraEnvs/getImageUrl',
  async (cpuArchitecture: CpuArchitecture, thunkAPI) => {
    const state = thunkAPI.getState() as RootStateDay1;
    // In OCM there is no late-binding, therefore every cluster created through the UI
    // will have at least one infra-env bound to it and its cpuArchitecture initialized
    // by default (to x86_64).
    const infraEnv = selectInfraEnvByCpuArchitecture(state, cpuArchitecture) as InfraEnv;
    const { data: preSignedUrl } = await InfraEnvsAPI.getImageUrl(infraEnv.id);
    return preSignedUrl;
  },
);
