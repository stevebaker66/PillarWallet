// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ReduxAsyncQueue from 'redux-async-queue';
import PillarSdk from 'services/api';
import { TYPE_SENT, UPDATE_INVITATIONS } from 'constants/invitationsConstants';
import { UPDATE_CONTACTS } from 'constants/contactsConstants';
import { UPDATE_CHATS } from 'constants/chatConstants';
import { updateConnectionsAction } from 'actions/connectionsActions';
import ChatService from 'services/chat';


const walletId = 'walletId';

const contactsMock = [
  {
    id: 2,
    ethAddress: '0x002',
    username: 'oldConnection',
    profileImage: 'https://google.com/logo.png',
    createdAt: 111111111,
    updatedAt: 111111112,
  },
];

const invitationsMock = [
  {
    id: 4,
    username: 'user4',
    profileImage: 'profileImgUrl4',
    type: TYPE_SENT,
    createdAt: 4444444444,
  },
];

const getContactsResponseMock = [
  {
    userId: 1,
    targetUserId: 2,
    status: 'accepted',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    targetUserInfo: {
      userId: 2,
      username: 'oldConnectionMigrated',
      profileImage: 'profileImgUrl',
      profileLargeImage: '',
      ethAddress: '0x002',
    },
  },
  {
    userId: 1,
    targetUserId: 4,
    status: 'pending',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    direction: 'sent',
    targetUserInfo: {
      userId: 4,
      username: 'user4',
      profileImage: 'profileImgUrl4',
      profileLargeImage: '',
      ethAddress: '0x004',
    },
  },
  {
    userId: 1,
    targetUserId: 3,
    status: 'accepted',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    targetUserInfo: {
      userId: 3,
      username: 'user3',
      profileImage: 'profileImgUrl3',
      profileLargeImage: '',
      ethAddress: '0x003',
    },
  },
  {
    userId: 1,
    targetUserId: 5,
    status: 'accepted',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    targetUserInfo: {
      userId: 5,
      username: 'user5',
      profileImage: 'profileImgUrl5',
      profileLargeImage: '',
      ethAddress: '0x005',
    },
  },
  {
    userId: 1,
    targetUserId: 6,
    status: 'accepted',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    targetUserInfo: {
      userId: 6,
      username: 'user6',
      profileImage: 'profileImgUrl6',
      profileLargeImage: '',
      ethAddress: '0x006',
    },
  },
  {
    userId: 1,
    targetUserId: 7,
    status: 'accepted',
    createdAt: '2019-04-17T08:57:54.547Z',
    updatedAt: '2019-04-17T08:57:54.547Z',
    targetUserInfo: {
      userId: 7,
      username: 'user7',
      profileImage: 'profileImgUrl7',
      profileLargeImage: '',
      ethAddress: '0x007',
    },
  },
];

const contactsResultMock = [
  {
    id: 2,
    ethAddress: '0x002',
    username: 'oldConnectionMigrated',
    profileImage: 'profileImgUrl',
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
    status: 'accepted',
  },
  {
    id: 3,
    ethAddress: '0x003',
    username: 'user3',
    profileImage: 'profileImgUrl3',
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
    status: 'accepted',
  },
  {
    id: 5,
    ethAddress: '0x005',
    username: 'user5',
    profileImage: 'profileImgUrl5',
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
    status: 'accepted',
  },
  {
    id: 6,
    ethAddress: '0x006',
    username: 'user6',
    profileImage: 'profileImgUrl6',
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
    status: 'accepted',
  },
  {
    id: 7,
    ethAddress: '0x007',
    username: 'user7',
    profileImage: 'profileImgUrl7',
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
    status: 'accepted',
  },
];

const invitationsResultMock = [
  {
    id: 4,
    username: 'user4',
    profileImage: 'profileImgUrl4',
    type: TYPE_SENT,
    createdAt: 1555491474.547,
    updatedAt: 1555491474.547,
  },
];

type SDK = {
  getContacts: Function,
};

const pillarSdk: SDK = new PillarSdk();
const chatService = new ChatService();

pillarSdk.getContacts = jest.fn(() => [...getContactsResponseMock]);
chatService.client.getUnreadMessagesCount = jest.fn(() => { return Promise.resolve({ unread: [] }); });
const mockStore = configureMockStore([thunk.withExtraArgument(pillarSdk), ReduxAsyncQueue]);

describe('Connections Actions tests', () => {
  let store;

  beforeEach(() => {
    const storeMock = {
      contacts: {
        data: [...contactsMock],
      },
      invitations: {
        data: [...invitationsMock],
      },
      session: { data: { isOnline: true } },
      user: {
        data: { walletId },
      },
      featureFlags: {
        data: {
          SMART_WALLET_ENABLED: false,
        },
      },
      chat: { data: { webSocketMessages: { received: [] } } },
    };
    store = mockStore({ ...storeMock });
  });

  it('Should expect processed contacts and invitations by the getContacts result from api', () => {
    const expectedActions = [
      { type: UPDATE_INVITATIONS, payload: invitationsResultMock },
      { type: UPDATE_CONTACTS, payload: contactsResultMock },
      { type: UPDATE_CHATS, payload: [] },
    ];
    return store.dispatch(updateConnectionsAction())
      .then(() => {
        const actualActions = store.getActions();
        expect(actualActions).toEqual(expectedActions);
      });
  });
});
