import api from '../api';
import { API_ENDPOINTS } from '../apiEndpoints';
import { encodeSearchText } from '../../utils/helper';
import { getParticipantsList } from '../participantService';
import type { ParticipantSearchParams, ParticipantSearchResponse } from '@app-types/participant';

export const getRequestSessionsList = async (params: any): Promise<any> => {
  try {
    const { page, limit, status, search, provinces, sites, pathway, pillar, type, format } = params;
    const queryParams = new URLSearchParams();

    if (status && status !== 'all-statuses' && status !== 'all-status') {
      queryParams.append('status', status.toUpperCase());
    }

    if (page != null) {
      queryParams.append('page', page.toString());
    }

    if (limit != null) {
      queryParams.append('limit', limit.toString());
    }

    if (search?.trim()) {
      queryParams.append('search', search.trim());
    }

    if (provinces && provinces !== 'all-provinces') {
      queryParams.append('provinces', provinces);
    }

    if (sites && sites !== 'all-sites') {
      queryParams.append('sites', sites);
    }

    if (pathway && pathway !== 'all-pathways') {
      queryParams.append('categories', pathway);
    }

    if (pillar && pillar !== 'all-pillars') {
      queryParams.append('pillar', pillar);
    }

    if (type && type !== 'all-types') {
      queryParams.append('type', type);
    }

    if (format && format !== 'all-formats') {
      queryParams.append('delivery_mode', format);
    }

    if (params.support_offering_type) {
      queryParams.append('support_offering_type', params.support_offering_type);
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

    if (status && status !== 'all-statuses' && status !== 'all-status') {
      queryParams.append('status', status.toUpperCase());
    }

    if (page != null) {
      queryParams.append('page', page.toString());
    }

    if (limit != null) {
      queryParams.append('limit', limit.toString());
    }

    if (search?.trim()) {
      queryParams.append('search', search.trim());
    }

    if (provinces && provinces !== 'all-provinces') {
      queryParams.append('provinces', provinces);
    }

    if (sites && sites !== 'all-sites') {
      queryParams.append('sites', sites);
    }

    if (pathway && pathway !== 'all-pathways') {
      queryParams.append('categories', pathway);
    }

    if (pillar && pillar !== 'all-pillars') {
      queryParams.append('pillar', pillar);
    }

    if (type && type !== 'all-types') {
      queryParams.append('type', type);
    }

    if (format && format !== 'all-formats') {
      queryParams.append('delivery_mode', format);
    }

    if (params.support_offering_type) {
      queryParams.append('support_offering_type', params.support_offering_type);
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