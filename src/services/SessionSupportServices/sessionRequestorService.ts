import api from '../api';
import { API_ENDPOINTS } from '../apiEndpoints';
import { encodeSearchText } from '../../utils/helper';
import { getParticipantsList } from '../participantService';
import type { ParticipantSearchParams, ParticipantSearchResponse } from '@app-types/participant';
import { OFFERING_FILTER_ALL_OPTIONS as FILTER_ALL, OFFERING_QUERY_PARAM_KEYS as QUERY_PARAM } from '@constants/SUPPORT_PROVIDER_CARDS';
import { MENTORING_ENTITY_TYPES } from '@constants/SP_MENU_OPTIONS';

export const getRequestSessionsList = async (params: any): Promise<any> => {
  try {
    const { page, limit, status, search, provinces, sites, pathway, pillar, type, format } = params;
    const queryParams = new URLSearchParams();

    if (status && status !== FILTER_ALL.ALL_STATUSES && status !== FILTER_ALL.ALL_STATUS) {
      queryParams.append(QUERY_PARAM.STATUS, status.toUpperCase());
    }

    if (page != null) {
      queryParams.append(QUERY_PARAM.PAGE, page.toString());
    }

    if (limit != null) {
      queryParams.append(QUERY_PARAM.LIMIT, limit.toString());
    }

    if (search?.trim()) {
      queryParams.append(QUERY_PARAM.SEARCH, search.trim());
    }

    if (provinces && provinces !== FILTER_ALL.ALL_PROVINCES) {
      queryParams.append(QUERY_PARAM.PROVINCES, provinces);
    }

    if (sites && sites !== FILTER_ALL.ALL_SITES) {
      queryParams.append(QUERY_PARAM.SITES, sites);
    }

    if (pathway && pathway !== FILTER_ALL.ALL_PATHWAYS) {
      queryParams.append(QUERY_PARAM.CATEGORIES, pathway);
    }

    if (pillar && pillar !== FILTER_ALL.ALL_PILLARS) {
      queryParams.append(QUERY_PARAM.PILLAR, pillar);
    }

    if (type && type !== FILTER_ALL.ALL_TYPES) {
      queryParams.append(QUERY_PARAM.TYPE, type);
    }

    if (format && format !== FILTER_ALL.ALL_FORMATS) {
      queryParams.append(QUERY_PARAM.DELIVERY_MODE, format);
    }

    if (params.support_offering_type) {
      queryParams.append(MENTORING_ENTITY_TYPES.SUPPORT_OFFERING_TYPE, params.support_offering_type);
    }

    const endpoint = `${API_ENDPOINTS.USER_SESSIONS_LIST}?${queryParams.toString()}`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};

export const getMyRequestsList = async (params: any): Promise<any> => {
  try {
    const { page, limit, status, search, provinces, sites, pathway, pillar, type, format } = params;
    const queryParams = new URLSearchParams();

    if (status && status !== FILTER_ALL.ALL_STATUSES && status !== FILTER_ALL.ALL_STATUS) {
      queryParams.append(QUERY_PARAM.STATUS, status.toUpperCase());
    }

    if (page != null) {
      queryParams.append(QUERY_PARAM.PAGE, page.toString());
    }

    if (limit != null) {
      queryParams.append(QUERY_PARAM.LIMIT, limit.toString());
    }

    if (search?.trim()) {
      queryParams.append(QUERY_PARAM.SEARCH, search.trim());
    }

    if (provinces && provinces !== FILTER_ALL.ALL_PROVINCES) {
      queryParams.append(QUERY_PARAM.PROVINCES, provinces);
    }

    if (sites && sites !== FILTER_ALL.ALL_SITES) {
      queryParams.append(QUERY_PARAM.SITES, sites);
    }

    if (pathway && pathway !== FILTER_ALL.ALL_PATHWAYS) {
      queryParams.append(QUERY_PARAM.CATEGORIES, pathway);
    }

    if (pillar && pillar !== FILTER_ALL.ALL_PILLARS) {
      queryParams.append(QUERY_PARAM.PILLAR, pillar);
    }

    if (type && type !== FILTER_ALL.ALL_TYPES) {
      queryParams.append(QUERY_PARAM.TYPE, type);
    }

    if (format && format !== FILTER_ALL.ALL_FORMATS) {
      queryParams.append(QUERY_PARAM.DELIVERY_MODE, format);
    }

    if (params.support_offering_type) {
      queryParams.append(MENTORING_ENTITY_TYPES.SUPPORT_OFFERING_TYPE, params.support_offering_type);
    }

    const endpoint = `${API_ENDPOINTS.REQUEST_SESSIONS_LIST}?${queryParams.toString()}`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching request sessions:', error);
    throw error;
  }
};


export const getParticipants = async (
  params: ParticipantSearchParams
): Promise<ParticipantSearchResponse> => {
  return getParticipantsList(params);
};

/**
 * Assign Mentees/Participants to Session by the Requestor
 * Endpoint: POST /mentoring/v1/sessions/addMentees/:sessionId
 *
 * @param sessionId - Session ID
 * @param menteeIds - Array of mentee/participant IDs
 * @returns A promise resolving to the API response
 */
export const requestorAssignMenteesToSession = async (
  sessionId: string | number,
  menteeIds: string[]
): Promise<any> => {
  try {
    const response = await api.post(
      API_ENDPOINTS.REQUESTOR_ASSIGN_MENTEES(sessionId),
      { mentees: menteeIds }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};