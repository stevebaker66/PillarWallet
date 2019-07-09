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
import * as React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SDK_PROVIDER } from 'react-native-dotenv';
import type { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import styled from 'styled-components/native';
import { format as formatDate } from 'date-fns';
import { CachedImage } from 'react-native-cached-image';

import { Container, ScrollWrapper } from 'components/Layout';
import Header from 'components/Header';
import { BoldText, BaseText } from 'components/Typography';
import ListItemWithImage from 'components/ListItem/ListItemWithImage';
import CollapsibleListItem from 'components/ListItem/CollapsibleListItem';
import Separator from 'components/Separator';
import { baseColors, fontSizes, spacing, UIColors } from 'utils/variables';
import { fetchTransactionsHistoryAction } from 'actions/historyActions';
import { disconnectExchangeProviderAction } from 'actions/exchangeActions';
import { EXCHANGE } from 'constants/navigationConstants';
import { PROVIDER_SHAPESHIFT } from 'constants/exchangeConstants';

import type { Assets } from 'models/Asset';
import type { Allowance, ExchangeProvider } from 'models/Offer';

import { getProviderDisplayName } from 'utils/exchange';
import Intercom from 'react-native-intercom';

type Props = {
  navigation: NavigationScreenProp<*>,
  assets: Assets,
  exchangeAllowances: Allowance[],
  fetchTransactionsHistory: Function,
  disconnectExchangeProvider: Function,
  connectedProviders: ExchangeProvider[],
};

type State = {
  openCollapseKey: string,
};

const SectionTitle = styled(BoldText)`
  font-size: ${fontSizes.medium}px;
  margin: 16px;
  margin-bottom: 10px;
`;

const ProviderItem = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: ${spacing.large}px;
  padding-left: 44px;
`;

const ProviderName = styled(BaseText)`
  font-size: ${fontSizes.small}px;
`;

const ProviderStatus = styled(BaseText)`
  font-size: ${fontSizes.extraSmall}px;
  color: ${props => props.isPending ? baseColors.darkGray : baseColors.jadeGreen};
`;

const DisconnectButton = styled.TouchableOpacity`
  padding: 10px;
  margin-right: -10px;
`;

const DisconnectButtonLabel = styled(BaseText)`
  font-size: ${fontSizes.extraSmall}px;
  color: ${baseColors.blueViolet};
`;

const ProviderIconWrapper = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${props => props.backgroundFill ? props.backgroundFill : baseColors.darkGray};
  align-items: center;
  justify-content: center;
`;

const ProviderIcon = styled(CachedImage)`
  width: 24px;
  height: 24px;
`;

const shapeshiftLogo = require('assets/images/exchangeProviders/logo_shapeshift_white.png');
const genericToken = require('assets/images/tokens/genericToken.png');

const getProviderLogo = (provider: string) => {
  switch (provider) {
    case PROVIDER_SHAPESHIFT:
      return (
        <ProviderIconWrapper backgroundFill={baseColors.black}>
          <ProviderIcon source={shapeshiftLogo} resizeMode="contain" style={{ marginTop: 0.5, marginLeft: 0.2 }} />
        </ProviderIconWrapper>
      );
    default:
      return (
        <ProviderIconWrapper />
      );
  }
};

class ExchangeInfo extends React.Component<Props, State> {
  state = {
    openCollapseKey: '',
  };

  componentDidUpdate(prevProps: Props) {
    const { navigation, exchangeAllowances, connectedProviders } = this.props;
    // Navigating from empty settings screen automatically
    if ((prevProps.exchangeAllowances !== exchangeAllowances || prevProps.connectedProviders !== connectedProviders)
      && !(exchangeAllowances.length || connectedProviders.length)) {
      navigation.navigate(EXCHANGE);
    }
  }

  toggleCollapse = (key: string) => {
    const { openCollapseKey } = this.state;
    if (openCollapseKey === key) {
      this.setState({ openCollapseKey: '' });
    } else {
      this.setState({ openCollapseKey: key });
    }
  };

  renderProvider = ({ item: { provider, enabled: providerEnabled } }: Object) => {
    return (
      <ProviderItem>
        <ProviderName>{getProviderDisplayName(provider)}</ProviderName>
        <ProviderStatus isPending={!providerEnabled}>
          {providerEnabled
            ? 'Enabled'
            : 'Pending'
          }
        </ProviderStatus>
      </ProviderItem>
    );
  };

  renderToken = ({ item: token }: Object) => {
    const { exchangeAllowances } = this.props;
    const { openCollapseKey } = this.state;
    const fullIconUrl = `${SDK_PROVIDER}/${token.iconUrl}?size=3`;
    const tokenAllowances = exchangeAllowances.filter(({ assetCode }) => assetCode === token.symbol);
    return (
      <CollapsibleListItem
        label={token.symbol}
        open={openCollapseKey === token.id}
        onPress={() => this.toggleCollapse(token.id)}
        customToggle={(
          <ListItemWithImage
            label={token.name}
            itemImageUrl={fullIconUrl || genericToken}
            fallbackSource={genericToken}
          />
        )}
        collapseContent={
          <FlatList
            data={tokenAllowances}
            keyExtractor={({ provider, assetCode }) => `${provider}-${assetCode}`}
            renderItem={this.renderProvider}
            initialNumToRender={8}
            onEndReachedThreshold={0.5}
            style={{ width: '100%', paddingLeft: 2 }}
            ItemSeparatorComponent={() => <Separator />}
          />
        }
      />
    );
  };

  renderExchangeProvider = ({ item: provider }: Object) => {
    const { disconnectExchangeProvider } = this.props;
    const { dateConnected, id: exchangeProviderId } = provider;
    const dateToShow = formatDate(new Date(dateConnected), 'MM.DD.YY');
    return (
      <ListItemWithImage
        label={getProviderDisplayName(exchangeProviderId)}
        customImage={getProviderLogo(exchangeProviderId)}
        imageDiameter={44}
        subtext={`Connected ${dateToShow}`}
        customAddon={(
          <DisconnectButton onPress={() => disconnectExchangeProvider(exchangeProviderId)}>
            <DisconnectButtonLabel>Disconnect</DisconnectButtonLabel>
          </DisconnectButton>
        )}
      />
    );
  };

  render() {
    const {
      navigation,
      assets,
      exchangeAllowances,
      fetchTransactionsHistory,
      connectedProviders,
    } = this.props;
    const assetsArray = Object.keys(assets)
      .map(id => assets[id])
      .filter(({ symbol }) => exchangeAllowances.find(({ assetCode }) => assetCode === symbol));

    return (
      <Container color={baseColors.white}>
        <Header
          title="settings"
          onBack={() => navigation.goBack(null)}
          nextText="Get help"
          onNextPress={() => Intercom.displayMessenger()}
          headerRightFlex={2}
          white
        />
        <ScrollWrapper color={UIColors.defaultBackgroundColor}>
          {!!connectedProviders.length &&
          <React.Fragment>
            <SectionTitle>Connected exchanges:</SectionTitle>
            <FlatList
              data={connectedProviders}
              keyExtractor={(item) => item.id}
              renderItem={this.renderExchangeProvider}
              initialNumToRender={8}
              onEndReachedThreshold={0.5}
              style={{ width: '100%' }}
            />
          </React.Fragment>}
          {!!assetsArray.length &&
            <React.Fragment>
              <SectionTitle>Enabled exchange assets:</SectionTitle>
              <FlatList
                data={assetsArray}
                keyExtractor={(item) => item.id}
                renderItem={this.renderToken}
                initialNumToRender={8}
                onEndReachedThreshold={0.5}
                style={{ width: '100%' }}
                ItemSeparatorComponent={() => <Separator spaceOnLeft={82} />}
                refreshControl={
                  <RefreshControl
                    refreshing={false}
                    onRefresh={() => fetchTransactionsHistory()}
                  />
                }
              />
            </React.Fragment>
          }
        </ScrollWrapper>
      </Container>
    );
  }
}

const mapStateToProps = ({
  assets: { data: assets },
  exchange: { data: { allowances: exchangeAllowances, connectedProviders } },
}) => ({
  assets,
  exchangeAllowances,
  connectedProviders,
});

const mapDispatchToProps = (dispatch: Function) => ({
  fetchTransactionsHistory: () => dispatch(
    fetchTransactionsHistoryAction(),
  ),
  disconnectExchangeProvider: (id: string) => dispatch(
    disconnectExchangeProviderAction(id),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeInfo);