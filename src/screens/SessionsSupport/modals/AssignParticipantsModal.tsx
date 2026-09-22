import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import Modal from '@components/ui/Modal';
import { theme } from '@config/theme';
import { VStack, HStack, Text, Button, ButtonText, Pressable, LucideIcon, Box, Input, InputField, InputSlot, } from '@ui';
import { STATUS as PARTICIPANT_DISPLAY_STATUS } from '@constants/PARTICIPANTS_LIST';
import { STATUS } from '@constants/app.constant';
import { getStatusColors } from '../../ParticipantsList/StatusBadge';
import { getInitials } from '@utils/helper';
import { useAuth } from '@contexts/AuthContext';
import { getParticipants } from '../../../services/SessionSupportServices/sessionRequestorService';
import { useLanguage } from '@contexts/LanguageContext';
import styles from '../styles';
import ConfirmAssignment from './ConfirmAssignment';
import ParticipantStatusBadge from './ParticipantStatusBadge';

interface AssignParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onConfirm: (selectedIds: string[]) => Promise<boolean> | void;
  skipEnrolledCheck?: boolean;
  title?: string;
  description?: string;
  submitActionVerb?: string;
  confirmTitle?: string;
  confirmSubtitle?: string;
  confirmButtonLabel?: string;
}

const PAGE_SIZE = 5;
const DEBOUNCE_MS = 500;

export default function AssignParticipantsModal({
  isOpen,
  onClose,
  session,
  onConfirm,
  skipEnrolledCheck = false,
  title,
  description,
  submitActionVerb,
  confirmTitle,
  confirmSubtitle,
  confirmButtonLabel,
}: AssignParticipantsModalProps): React.JSX.Element {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedParticipants = useMemo(() => {
    return participants.filter((p) => selectedIds.includes(p.userId));
  }, [participants, selectedIds]);

  // Memoized extraData for FlatList performance and re-rendering on status/loading changes
  const extraData = useMemo(() => ({ isLoading, selectedIds }), [isLoading, selectedIds]);

  // Refs for race-condition prevention and debounced search
  const isLoadingRef = useRef(false);
  const requestCountRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMore = total === null || participants.length < total;

  /**
   * Core paginated fetch — mirrors the Choose Supervisor doFetch pattern.
   * `reset = true` clears the list (used for modal open, search, etc.).
   * `requestCountRef` ensures stale responses from earlier requests are discarded.
   */
  const doFetch = useCallback(
    async (page: number, search: string, reset: boolean) => {
      if (!user?.id) return;
      if (!reset && (isLoadingRef.current)) return;

      const requestId = ++requestCountRef.current;
      isLoadingRef.current = true;
      setIsLoading(true);

      if (reset) {
        setParticipants([]);
        setTotal(null);
        setCurrentPage(1);
      }

      try {
        const response = await getParticipants({
          userId: user.id,
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: `${STATUS.IN_PROGRESS},${STATUS.GRADUATED}`,
        });

        // Discard response if a newer request has been initiated
        if (requestId !== requestCountRef.current) return;

        const fetchedList: any[] = response?.result?.data || [];
        const eligible = fetchedList;

        // Total from the API; fall back to fetched data length
        const apiTotal = response?.total ?? response?.count ?? fetchedList.length;

        setTotal(apiTotal);
        setCurrentPage(page);
        setParticipants((prev) => (reset ? eligible : [...prev, ...eligible]));
      } catch (error) {
        if (requestId === requestCountRef.current) {
          console.error('Error fetching participants:', error);
        }
      } finally {
        if (requestId === requestCountRef.current) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [user?.id],
  );

  // Fetch first page when the modal opens; reset all state
  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setSearchQuery('');
    isLoadingRef.current = false;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    doFetch(1, '', true);
  }, [isOpen, doFetch]);

  // Debounced search — resets pagination and list on each new query
  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        doFetch(1, text, true);
      }, DEBOUNCE_MS);
    },
    [doFetch],
  );

  if (!isOpen) return <></>;

  const sessionName = session?.title || session?.name || '';

  const footerContent = (
    <HStack {...styles.assignParticipantsFooterContainer}>
      <Button
        variant="outlineghost"
        {...styles.assignParticipantsCancelButton}
        onPress={onClose}>
        <ButtonText {...styles.assignParticipantsCancelButtonText}>
          {t('lc.sessionsSupport.assignParticipantsModal.cancel')}
        </ButtonText>
      </Button>
      <Button
        variant="solid"
        {...styles.assignParticipantsConfirmButton}
        onPress={() => {
          setIsConfirmOpen(true);
        }}
        disabled={selectedIds.length === 0 || isLoading}
        opacity={selectedIds.length === 0 || isLoading ? 0.5 : 1}>
        <ButtonText {...styles.assignParticipantsConfirmButtonText}>
          {t('lc.sessionsSupport.assignParticipantsModal.assignButtonText', { defaultValue: `${submitActionVerb || 'Assign'} ({{count}})`, count: selectedIds.length })}
        </ButtonText>
      </Button>
    </HStack>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        headerTitle={title || 'Assign Participants to Session'}
        headerDescription={description || `Select participants from your caseload to assign to "${sessionName}"`}
        showCloseButton={true}
        footerContent={footerContent}
        bodyProps={styles.assignParticipantsModalBodyProps}
      >
        <VStack {...styles.assignParticipantsContentVStack}>
          {/* Search Input */}
          <Input {...styles.assignParticipantsSearchInput}>
            <InputSlot>
              <LucideIcon name="Search" size={18} color="$textMutedForeground" />
            </InputSlot>
            <InputField
              placeholder="Search participants by name or ID..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false} />
          </Input>

          {/* Counts display + Clear All */}
          <HStack {...styles.assignParticipantsCountHeaderHStack} py="$3.5">
            <HStack {...styles.assignParticipantsCountLeftHStack}>
              <LucideIcon name="Users" size={14} color="$textMuted" />
              <Text {...styles.assignParticipantsCountLeftText}>
                <Text fontWeight="$medium" color="$black">
                  {total !== null ? total : '–'}{' '}
                </Text>
                {t('lc.sessionsSupport.assignParticipantsModal.eligibleParticipants', 'eligible participants')}
              </Text>
            </HStack>
            <HStack {...styles.assignParticipantsCountRightHStack}>
              <Text {...styles.assignParticipantsCountRightText}>
                {selectedIds.length} {t('lc.sessionsSupport.assignParticipantsModal.selected', 'selected')}
              </Text>
              {selectedIds.length > 0 && (
                <>
                  <Box {...styles.assignParticipantsDivider} />
                  <Pressable onPress={() => setSelectedIds([])}>
                    <Text {...styles.assignParticipantsClearAllText}>
                      {t('lc.sessionsSupport.assignParticipantsModal.clear', 'Clear')}
                    </Text>
                  </Pressable>
                </>
              )}
            </HStack>
          </HStack>

          {/* Scrollable participant list (FlatList for virtualised incremental loading) */}
          <FlatList
            data={participants}
            extraData={extraData}
            keyExtractor={(p) => p.userId}
            renderItem={({ item: p }) => {
              const isSelected = selectedIds.includes(p.userId);

              return (
                <Pressable
                  onPress={() => {
                    setSelectedIds((prev) =>
                      prev.includes(p.userId)
                        ? prev.filter((id) => id !== p.userId)
                        : [...prev, p.userId],
                    );
                  }}
                  {...styles.assignParticipantsCard}
                  borderColor={isSelected ? '$primary500' : '$borderColor'}
                  sx={{
                    ':hover': {
                      borderColor: isSelected ? '$primary500' : '$primary300',
                    },
                  }}
                  style={styles.assignParticipantsCardStyle}>
                  <HStack alignItems="center" space="md" width="100%">
                    {/* Circular checkbox indicator */}
                    <Box {...styles.assignParticipantsCheckboxBase} borderColor={isSelected ? '$primary500' : '$borderColor'} bg={isSelected ? '$primary500' : 'transparent'}>
                      {isSelected && (
                        <LucideIcon name="Check" size={12} color="$white" />
                      )}
                    </Box>

                    {/* Info */}
                    <VStack {...styles.assignParticipantsInfoVStack}>
                      <Text {...styles.assignParticipantsNameText}>
                        {p.name}
                      </Text>
                      <HStack {...styles.assignParticipantsMetaHStack}>
                        <Text {...styles.assignParticipantsMetaText}>
                          {p.userId}
                        </Text>
                        {/* <Text {...styles.assignParticipantsMetaText}>
                        •
                      </Text>
                      <Text {...styles.assignParticipantsMetaText}>
                        {progressPercentage}% Progress
                      </Text> */}
                      </HStack>
                    </VStack>

                    {/* Status Badge */}
                    <ParticipantStatusBadge status={p.status || ''} />
                  </HStack>
                </Pressable>
              );
            }}
            style={styles.assignParticipantsFlatList}
            contentContainerStyle={styles.assignParticipantsFlatListContent}
            onEndReached={() => {
              if (!isLoadingRef.current && hasMore && total !== null) {
                doFetch(currentPage + 1, searchQuery, false);
              }
            }}
            onEndReachedThreshold={0.5}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            ListEmptyComponent={() => {
              if (isLoading) {
                return (
                  <Box {...styles.assignParticipantsLoadingContainer}>
                    <ActivityIndicator size="large" color={theme.tokens.colors.primary500} />
                  </Box>
                );
              }
              if (total !== null) {
                return (
                  <Box {...styles.assignParticipantsEmptyContainer}>
                    <LucideIcon name="SearchX" size={36} color="$textMutedForeground" />
                    <Text {...styles.assignParticipantsEmptyText}>
                      {t('lc.sessionsSupport.assignParticipantsModal.noResultsFound', 'No results found')}
                    </Text>
                  </Box>
                );
              }
              return null;
            }}
            ListFooterComponent={() => {
              if (isLoading && participants.length > 0) {
                return (
                  <Box {...styles.assignParticipantsFooterLoadingContainer}>
                    <ActivityIndicator size="small" color={theme.tokens.colors.primary500} />
                  </Box>
                );
              }
              return null;
            }}
          />
        </VStack>
      </Modal>

      <ConfirmAssignment
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          const success = await onConfirm(selectedIds);
          if (success) {
            setIsConfirmOpen(false);
            onClose();
          }
        }}
        session={session}
        selectedParticipants={selectedParticipants}
        title={confirmTitle}
        subtitle={confirmSubtitle}
        confirmButtonLabel={confirmButtonLabel}
      />
    </>
  );
}
