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
import styled from 'styled-components/native';
import { Animated, Dimensions, Keyboard } from 'react-native';
import SearchBar from 'components/SearchBar';
import type { NavigationEventSubscription, NavigationScreenProp } from 'react-navigation';
import { withNavigation } from 'react-navigation';

const { height: screenHeight } = Dimensions.get('window');

type State = {
  query: string,
  searchIsFocused: boolean,
  fullScreenOverlayOpacity: Animated.Value,
}

type Props = {
  navigation: NavigationScreenProp<*>,
  onSearchChange: Function,
  itemSearchState?: boolean,
  searchInputPlaceholder?: string,
  backgroundColor?: string,
  hideSearch?: boolean,
  white?: boolean,
  onSearchFocus?: Function,
  wrapperStyle?: Object,
}

const SearchBarWrapper = styled.View`
  width: 100%;
  position: relative;
  z-index: 101;
`;

const FullScreenOverlayWrapper = styled.TouchableOpacity`
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: ${screenHeight};
  position: absolute;
`;

const FullScreenOverlay = styled.View`
  width: 100%;
  height: ${screenHeight};
  background-color: rgba(0,0,0,.6);
`;

const AnimatedFullScreenOverlay = Animated.createAnimatedComponent(FullScreenOverlay);

const MIN_QUERY_LENGTH = 2;

class SearchBlock extends React.Component<Props, State> {
  _willBlur: NavigationEventSubscription;
  _keyboardDidShow: NavigationEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      query: '',
      searchIsFocused: false,
      fullScreenOverlayOpacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this._willBlur = navigation.addListener('willBlur', this.onScreenBlur);
    this._keyboardDidShow = Keyboard.addListener('keyboardDidShow', this.onKeyboardShown);
  }

  componentWillUnmount() {
    this._willBlur.remove();
    this._keyboardDidShow.remove();
  }

  onScreenBlur = () => {
    Keyboard.dismiss();
    this.animateFullScreenOverlayOpacity(true);
  };

  onKeyboardShown = () => {
    const { onSearchFocus } = this.props;
    if (onSearchFocus) onSearchFocus();
  };

  animateFullScreenOverlayOpacity = (active: boolean, onEnd?: Function) => {
    const { fullScreenOverlayOpacity } = this.state;
    if (!active) {
      fullScreenOverlayOpacity.setValue(0);
      Animated.timing(fullScreenOverlayOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }).start();
    } else {
      fullScreenOverlayOpacity.setValue(1);
      Animated.timing(fullScreenOverlayOpacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }).start(() => onEnd && onEnd());
    }
  };

  handleSearchChange = (query: any) => {
    this.props.onSearchChange(query);
    this.setState({ query });
  };

  handleSearchBlur = () => {
    this.setState({
      searchIsFocused: false,
    });
    Keyboard.dismiss();
    this.animateFullScreenOverlayOpacity(true, this.animateAfterDelay);
  };

  handleSearchFocus = () => {
    this.setState({
      searchIsFocused: true,
    });
    this.animateFullScreenOverlayOpacity(false);
  };

  animateAfterDelay = () => {
    this.setState({
      searchIsFocused: false,
    });
  };

  render() {
    const {
      itemSearchState,
      searchInputPlaceholder,
      hideSearch,
      wrapperStyle,
    } = this.props;
    const {
      query,
      searchIsFocused,
      fullScreenOverlayOpacity,
    } = this.state;

    const inSearchMode = (query.length >= MIN_QUERY_LENGTH && itemSearchState);

    return (
      <React.Fragment>
        {!!searchIsFocused && !inSearchMode &&
        <FullScreenOverlayWrapper onPress={this.handleSearchBlur}>
          <AnimatedFullScreenOverlay
            style={{
              opacity: fullScreenOverlayOpacity,
            }}
          />
        </FullScreenOverlayWrapper>
        }
        {!hideSearch &&
          <SearchBarWrapper style={wrapperStyle}>
            <SearchBar
              inputProps={{
                onChange: this.handleSearchChange,
                onBlur: this.handleSearchBlur,
                onFocus: this.handleSearchFocus,
                value: query,
                autoCapitalize: 'none',
              }}
              placeholder={searchInputPlaceholder}
              marginBottom="0"
            />
          </SearchBarWrapper>
        }
      </React.Fragment>
    );
  }
}

export default withNavigation(SearchBlock);
