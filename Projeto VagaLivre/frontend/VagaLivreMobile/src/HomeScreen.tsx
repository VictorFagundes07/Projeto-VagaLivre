import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api, errorMessage, Garage, User, vehicles } from './api';
import { Brand, Button, colors, Field, Notice, styles as s } from './ui';
import { loadFavorites, saveFavorites } from './favorites';

type Section = 'explore' | 'profile' | 'mine' | 'favorites' | 'settings';
const menuItems = [
  ['profile', 'PERFIL'],
  ['mine', 'MINHAS GARAGENS'],
  ['favorites', 'GARAGENS FAVORITAS'],
  ['settings', 'CONFIGURAÇÕES'],
] as const;
const headings: Record<Section, string> = {
  explore: 'Encontre seu próximo lugar',
  profile: 'Perfil',
  mine: 'Minhas garagens',
  favorites: 'Garagens favoritas',
  settings: 'Configurações',
};

export default function HomeScreen({
  user,
  onGarage,
  onAnnounce,
  profile,
  settings,
}: {
  user: User;
  onGarage: (garage: Garage) => void;
  onAnnounce: () => void;
  profile: React.ReactNode;
  settings: React.ReactNode;
}) {
  const [section, setSection] = useState<Section>('explore');
  const [menuOpen, setMenuOpen] = useState(false);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [favoriteLoadFailed, setFavoriteLoadFailed] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  useEffect(() => {
    let active = true;
    loadFavorites(user.id)
      .then(ids => {
        if (active) {
          setFavoriteIds(ids);
        }
      })
      .catch(() => {
        if (active) {
          setFavoriteLoadFailed(true);
          setFavoriteError(
            'Não foi possível carregar suas garagens favoritas.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setFavoritesReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      if (section === 'profile' || section === 'settings') {
        return;
      }
      let active = true;
      setBusy(true);
      setError('');
      setGarages([]);
      api
        .get<Garage[]>(section === 'mine' ? '/garages/mine' : '/garages')
        .then(({ data }) => {
          if (active) {
            setGarages(data);
          }
        })
        .catch(e => {
          if (active) {
            setError(errorMessage(e));
          }
        })
        .finally(() => {
          if (active) {
            setBusy(false);
          }
        });
      return () => {
        active = false;
      };
      // revision repeats the request when the user presses Atualizar.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section, revision]),
  );

  function select(next: Section) {
    setSection(next);
    setQuery('');
    setMenuOpen(false);
  }

  async function toggleFavorite(id: string) {
    if (!favoritesReady || savingFavorite || favoriteLoadFailed) {
      return;
    }
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter(item => item !== id)
      : [...favoriteIds, id];
    setSavingFavorite(true);
    setFavoriteError('');
    try {
      await saveFavorites(user.id, next);
      setFavoriteIds(next);
    } catch {
      setFavoriteError(
        'Não foi possível salvar seus favoritos. Tente novamente.',
      );
    } finally {
      setSavingFavorite(false);
    }
  }

  const filtered = garages.filter(
    garage =>
      (section !== 'favorites' || favoriteIds.includes(garage.id)) &&
      `${garage.title} ${garage.address}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.toLocaleLowerCase('pt-BR')),
  );
  const loading = busy || (section === 'favorites' && !favoritesReady);

  return (
    <View style={s.page}>
      <View style={s.homeHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir opções"
          accessibilityState={{ expanded: menuOpen }}
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [s.menuButton, pressed && s.pressed]}
        >
          <View style={s.hamburgerLine} />
          <View style={s.hamburgerLine} />
          <View style={s.hamburgerLine} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="VagaLivre, voltar ao início"
          onPress={() => select('explore')}
        >
          <Brand compact />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        {section !== 'explore' && (
          <Button
            quiet
            title="Voltar para início"
            onPress={() => select('explore')}
          />
        )}
        {section === 'explore' ? (
          <View style={s.homeWelcome}>
            <Text style={s.caption}>BOM TER VOCÊ AQUI</Text>
            <Text style={s.title}>Olá, {user.fullName.split(' ')[0]}.</Text>
            <Text style={s.subtitle}>
              Uma garagem perto de você. Mais espaço para sua rotina.
            </Text>
            <Button title="+ Anunciar minha garagem" onPress={onAnnounce} />
          </View>
        ) : (
          <Text accessibilityRole="header" style={s.title}>
            {headings[section]}
          </Text>
        )}

        {section === 'profile' ? (
          profile
        ) : section === 'settings' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Conexão do aplicativo</Text>
            <Text style={s.subtitle}>
              Consulte ou altere o endereço do servidor usado neste dispositivo.
            </Text>
            {settings}
          </View>
        ) : (
          <>
            <View style={s.sectionHeading}>
              <Text accessibilityRole="header" style={[s.cardTitle, s.grow]}>
                {section === 'explore'
                  ? 'Garagens disponíveis'
                  : section === 'mine'
                  ? 'Seus espaços'
                  : 'Seus lugares salvos'}
              </Text>
              <Button
                quiet
                title="Atualizar"
                onPress={() => setRevision(old => old + 1)}
                busy={busy}
              />
            </View>
            {section === 'mine' && (
              <Button title="+ Anunciar minha garagem" onPress={onAnnounce} />
            )}
            {section === 'favorites' && (
              <Text style={s.caption}>
                Seus favoritos ficam salvos nesta conta, neste dispositivo.
              </Text>
            )}
            <Field
              label="Buscar por título ou endereço"
              placeholder="Onde você quer estacionar?"
              value={query}
              onChangeText={setQuery}
            />
            <Notice text={error} />
            <Notice text={favoriteError} />
            {loading && (
              <ActivityIndicator
                accessibilityLabel="Carregando garagens"
                color={colors.blue}
              />
            )}
            {!loading && !error && filtered.length === 0 && (
              <View style={[s.card, s.empty]}>
                <Text style={s.cardTitle}>
                  {section === 'favorites' && !query
                    ? 'Seus favoritos começam aqui.'
                    : 'Nenhuma garagem por aqui ainda.'}
                </Text>
                <Text style={s.subtitle}>
                  {query
                    ? 'Tente outro título ou endereço.'
                    : section === 'favorites'
                    ? 'Toque no coração de uma garagem para salvá-la.'
                    : section === 'mine'
                    ? 'Anuncie seu primeiro espaço para começar.'
                    : 'Os novos anúncios aparecerão aqui.'}
                </Text>
                {section === 'favorites' && (
                  <Button
                    quiet
                    title="Encontrar garagens"
                    onPress={() => select('explore')}
                  />
                )}
              </View>
            )}
            {filtered.map(garage => (
              <View key={garage.id} style={s.card}>
                <View style={s.sectionHeading}>
                  <View style={[s.row, s.grow]}>
                    <Text style={s.badge}>
                      {garage.isActive ? 'Ativa' : 'Desativada'}
                    </Text>
                    <Text style={s.caption}>
                      {vehicles[garage.maxVehicleType]}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${
                      favoriteIds.includes(garage.id)
                        ? 'Remover dos favoritos'
                        : 'Favoritar'
                    }: ${garage.title}`}
                    accessibilityState={{
                      selected: favoriteIds.includes(garage.id),
                      disabled:
                        !favoritesReady || savingFavorite || favoriteLoadFailed,
                    }}
                    disabled={
                      !favoritesReady || savingFavorite || favoriteLoadFailed
                    }
                    onPress={() => toggleFavorite(garage.id)}
                    style={({ pressed }) => [
                      s.favoriteButton,
                      pressed && s.pressed,
                    ]}
                  >
                    <Text style={s.favoriteIcon}>
                      {favoriteIds.includes(garage.id) ? '♥' : '♡'}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${garage.title}`}
                  onPress={() => onGarage(garage)}
                  style={({ pressed }) => [s.garageBody, pressed && s.pressed]}
                >
                  <Text style={s.cardTitle}>{garage.title}</Text>
                  <Text style={s.subtitle}>{garage.address}</Text>
                  <Text style={s.caption} numberOfLines={2}>
                    {garage.description}
                  </Text>
                  <Text style={s.garageLink}>Ver garagem →</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={s.drawerOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar menu lateral"
            style={s.drawerBackdrop}
            onPress={() => setMenuOpen(false)}
          />
          <SafeAreaView
            testID="navigation-drawer"
            style={s.drawer}
            accessibilityViewIsModal
          >
            <ScrollView contentContainerStyle={s.drawerContent}>
              <View style={s.sectionHeading}>
                <Text accessibilityRole="header" style={s.cardTitle}>
                  Sua conta
                </Text>
                <Button
                  quiet
                  title="Fechar"
                  onPress={() => setMenuOpen(false)}
                />
              </View>
              <View style={s.drawerIdentity}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {user.fullName.slice(0, 1).toLocaleUpperCase('pt-BR')}
                  </Text>
                </View>
                <Text style={s.cardTitle}>{user.fullName}</Text>
                <Text style={s.caption}>{user.email}</Text>
              </View>
              <View style={s.drawerItems}>
                {menuItems.map(([key, label]) => (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: section === key }}
                    onPress={() => select(key)}
                    style={({ pressed }) => [
                      s.drawerItem,
                      section === key && s.drawerItemActive,
                      pressed && s.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        s.drawerItemText,
                        section === key && s.drawerItemTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.caption}>
                VagaLivre · Seu próximo lugar começa aqui.
              </Text>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
