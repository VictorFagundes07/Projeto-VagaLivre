import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  api,
  DEFAULT_API_URL,
  errorMessage,
  Garage,
  setToken,
  User,
  vehicles,
} from './api';
import { Brand, Button, colors, Field, Notice, styles as s } from './ui';
import { restoreServer, saveServer } from './serverConfig';

type Routes = {
  Home: undefined;
  Garage: { garage: Garage };
  Editor: { garage?: Garage };
};
const Stack = createNativeStackNavigator<Routes>();

function Page({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Connection() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(api.defaults.baseURL || DEFAULT_API_URL);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Button
        secondary
        title={open ? 'Fechar conexão' : 'Conexão com o servidor'}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={s.card}>
          <Field
            label="Endereço da API"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={s.caption}>
            Emulador Android: 10.0.2.2. Navegador: localhost. Celular físico: IP
            do computador na mesma rede Wi-Fi.
          </Text>
          <Notice text={message} />
          <Button
            title="Usar este endereço"
            busy={saving}
            onPress={async () => {
              setSaving(true);
              try {
                await saveServer(url);
                setMessage('');
                setOpen(false);
              } catch (e) {
                setMessage(errorMessage(e));
              } finally {
                setSaving(false);
              }
            }}
          />
        </View>
      )}
    </View>
  );
}

function Auth({ onLogin }: { onLogin: (user: User) => void }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof form) => (value: string) =>
    setForm(old => ({ ...old, [key]: value }));
  async function submit() {
    setError('');
    if (
      !form.email.trim() ||
      !form.password ||
      (register && (!form.fullName.trim() || !form.phone.trim() || !form.cpf))
    ) {
      setError('Preencha todos os campos para continuar.');
      return;
    }
    if (register && (!/^\d{11}$/.test(form.cpf) || form.password.length < 8)) {
      setError(
        'Informe 11 dígitos no CPF e uma senha com pelo menos 8 caracteres.',
      );
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await api.post('/auth/register', { ...form, email: form.email.trim() });
      }
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });
      setToken(data.accessToken);
      const { data: user } = await api.get<User>('/users/me');
      onLogin(user);
    } catch (e) {
      setToken(null);
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <View
        style={{ maxWidth: 460, width: '100%', alignSelf: 'center', gap: 24 }}
      >
        <Brand large />
        <View style={{ gap: 8 }}>
          <Text style={s.badge}>MAIS ESPAÇO PARA SUA ROTINA</Text>
          <Text style={s.title}>
            {register
              ? 'Seu lugar no VagaLivre.'
              : 'Bem-vindo ao seu próximo lugar.'}
          </Text>
          <Text style={s.subtitle}>
            Encontre uma garagem ou compartilhe a sua. Tudo com a mesma conta.
          </Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>
            {register ? 'Crie sua conta' : 'Entre na sua conta'}
          </Text>
          {register && (
            <Field
              label="Nome completo"
              value={form.fullName}
              onChangeText={update('fullName')}
              autoComplete="name"
              maxLength={150}
            />
          )}
          <Field
            label="E-mail"
            placeholder="voce@email.com"
            value={form.email}
            onChangeText={update('email')}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            maxLength={150}
          />
          {register && (
            <>
              <Field
                label="Telefone"
                placeholder="DDD + número"
                value={form.phone}
                onChangeText={update('phone')}
                keyboardType="phone-pad"
                maxLength={20}
              />
              <Field
                label="CPF (somente números)"
                value={form.cpf}
                onChangeText={value => update('cpf')(value.replace(/\D/g, ''))}
                keyboardType="number-pad"
                maxLength={11}
              />
            </>
          )}
          <Field
            label="Senha"
            placeholder={register ? 'Pelo menos 8 caracteres' : 'Sua senha'}
            value={form.password}
            onChangeText={update('password')}
            secureTextEntry
            maxLength={100}
          />
          <Notice text={error} />
          <Button
            title={register ? 'Criar conta e entrar' : 'Entrar'}
            onPress={submit}
            busy={busy}
          />
          <Button
            secondary
            title={register ? 'Já tenho uma conta' : 'Quero criar uma conta'}
            busy={busy}
            onPress={() => {
              setRegister(!register);
              setError('');
            }}
          />
        </View>
        <Connection />
        <Text style={s.caption}>
          Uma conta. Dois caminhos: estacionar ou anunciar.
        </Text>
      </View>
    </Page>
  );
}

function Profile({
  user,
  onChange,
  onLogout,
}: {
  user: User;
  onChange: (user: User) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirm, setConfirm] = useState(false);
  async function save() {
    if (!name.trim() || !phone.trim()) {
      setSuccess(false);
      setMessage('Preencha nome e telefone.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { data } = await api.put<User>('/users/me', {
        fullName: name.trim(),
        phone: phone.trim(),
      });
      onChange(data);
      setSuccess(true);
      setMessage('Perfil atualizado.');
    } catch (e) {
      setSuccess(false);
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function deactivate() {
    setBusy(true);
    try {
      await api.delete('/users/me');
      onLogout();
    } catch (e) {
      setSuccess(false);
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Seu perfil</Text>
      <Text style={s.subtitle}>
        Você pode anunciar e encontrar garagens com esta conta.
      </Text>
      <Field
        label="Nome completo"
        value={name}
        onChangeText={setName}
        maxLength={150}
      />
      <Field
        label="Telefone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={20}
      />
      <Text style={s.caption}>{user.email}</Text>
      <Notice text={message} success={success} />
      <Button title="Salvar perfil" onPress={save} busy={busy} />
      <Button secondary title="Sair da conta" onPress={onLogout} busy={busy} />
      {confirm ? (
        <View style={{ gap: 12 }}>
          <Text style={s.subtitle}>
            Sua conta e suas garagens serão desativadas. Deseja continuar?
          </Text>
          <Button
            danger
            title="Confirmar desativação da conta"
            onPress={deactivate}
            busy={busy}
          />
          <Button
            secondary
            title="Manter minha conta"
            onPress={() => setConfirm(false)}
            busy={busy}
          />
        </View>
      ) : (
        <Button
          danger
          title="Desativar minha conta"
          onPress={() => setConfirm(true)}
          busy={busy}
        />
      )}
    </View>
  );
}

function Home({
  navigation,
  user,
  onChange,
  onLogout,
}: NativeStackScreenProps<Routes, 'Home'> & {
  user: User;
  onChange: (user: User) => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<'explore' | 'mine' | 'profile'>('explore');
  const [garages, setGarages] = useState<Garage[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      // Incrementar revision solicita novamente a listagem ao tocar em Atualizar.
      void revision;
      if (tab === 'profile') {
        return;
      }
      let active = true;
      setBusy(true);
      setError('');
      setGarages([]);
      api
        .get<Garage[]>(tab === 'mine' ? '/garages/mine' : '/garages')
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
    }, [tab, revision]),
  );
  const filtered = garages.filter(g =>
    `${g.title} ${g.address}`
      .toLocaleLowerCase('pt-BR')
      .includes(query.toLocaleLowerCase('pt-BR')),
  );
  return (
    <Page>
      <Brand />
      <View style={s.hero}>
        <Text style={s.badge}>SEU ESPAÇO, SUAS POSSIBILIDADES</Text>
        <Text style={s.title}>Olá, {user.fullName.split(' ')[0]}.</Text>
        <Text style={s.subtitle}>
          Uma garagem disponível pode facilitar o seu dia — ou virar uma
          oportunidade.
        </Text>
        <Button
          title="+ Anunciar minha garagem"
          onPress={() => navigation.navigate('Editor', {})}
        />
      </View>
      <View style={s.tabs}>
        {(
          [
            ['explore', 'Encontrar'],
            ['mine', 'Minhas garagens'],
            ['profile', 'Meu perfil'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            style={[s.tab, tab === key && s.tabActive]}
            onPress={() => {
              setTab(key);
              setQuery('');
            }}
          >
            <Text style={[s.tabText, tab === key && { color: colors.blue }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'profile' ? (
        <Profile user={user} onChange={onChange} onLogout={onLogout} />
      ) : (
        <>
          <View style={s.row}>
            <Text style={[s.cardTitle, { flex: 1 }]}>
              {tab === 'mine' ? 'Seus espaços' : 'Encontre seu próximo lugar'}
            </Text>
            <Button
              secondary
              title="Atualizar"
              onPress={() => setRevision(old => old + 1)}
              busy={busy}
            />
          </View>
          <Field
            label="Buscar por título ou endereço"
            placeholder="Onde você quer estacionar?"
            value={query}
            onChangeText={setQuery}
          />
          <Notice text={error} />
          {busy && <ActivityIndicator size="large" color={colors.blue} />}
          {!busy && !error && filtered.length === 0 && (
            <View style={[s.card, s.empty]}>
              <Text style={s.cardTitle}>Nenhuma garagem por aqui ainda.</Text>
              <Text style={s.subtitle}>
                {query
                  ? 'Tente outro título ou endereço.'
                  : tab === 'mine'
                  ? 'Anuncie seu primeiro espaço para começar.'
                  : 'Os novos anúncios aparecerão aqui.'}
              </Text>
            </View>
          )}
          {filtered.map(garage => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver ${garage.title}`}
              key={garage.id}
              style={s.card}
              onPress={() => navigation.navigate('Garage', { garage })}
            >
              <View style={s.row}>
                <Text style={s.badge}>
                  {garage.isActive ? 'Ativa' : 'Desativada'}
                </Text>
                <Text style={s.caption}>{vehicles[garage.maxVehicleType]}</Text>
              </View>
              <Text style={s.cardTitle}>{garage.title}</Text>
              <Text style={s.subtitle}>{garage.address}</Text>
              <Text style={s.caption} numberOfLines={2}>
                {garage.description}
              </Text>
              <Text style={{ color: colors.blue, fontWeight: '700' }}>
                Ver garagem →
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </Page>
  );
}

function GarageDetails({
  route,
  navigation,
  user,
}: NativeStackScreenProps<Routes, 'Garage'> & { user: User }) {
  const { garage } = route.params;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function deactivate() {
    setBusy(true);
    try {
      await api.delete(`/garages/${garage.id}`);
      navigation.popToTop();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <View style={s.hero}>
        <Text style={s.badge}>
          {garage.isActive ? 'Garagem ativa' : 'Garagem desativada'}
        </Text>
        <Text style={s.title}>{garage.title}</Text>
        <Text style={s.subtitle}>{garage.address}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Sobre o espaço</Text>
        <Text style={s.subtitle}>{garage.description}</Text>
        <Text style={s.label}>
          Porte máximo: {vehicles[garage.maxVehicleType]}
        </Text>
        <Text style={s.caption}>
          Latitude: {garage.latitude} · Longitude: {garage.longitude}
        </Text>
      </View>
      {garage.ownerId === user.id ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>Gerencie seu anúncio</Text>
          <Button
            title="Editar garagem"
            onPress={() => navigation.navigate('Editor', { garage })}
            busy={busy}
          />
          {garage.isActive &&
            (confirm ? (
              <>
                <Text style={s.subtitle}>
                  A garagem deixará de aparecer na busca. Confirmar?
                </Text>
                <Button
                  danger
                  title="Confirmar desativação"
                  onPress={deactivate}
                  busy={busy}
                />
                <Button
                  secondary
                  title="Cancelar"
                  onPress={() => setConfirm(false)}
                  busy={busy}
                />
              </>
            ) : (
              <Button
                danger
                title="Desativar garagem"
                onPress={() => setConfirm(true)}
              />
            ))}
          <Notice text={error} />
        </View>
      ) : (
        <View style={s.card}>
          <Text style={s.cardTitle}>Gostou deste espaço?</Text>
          <Text style={s.subtitle}>
            As reservas e os pagamentos estarão disponíveis em uma próxima
            etapa.
          </Text>
        </View>
      )}
    </Page>
  );
}

function GarageEditor({
  route,
  navigation,
}: NativeStackScreenProps<Routes, 'Editor'>) {
  const garage = route.params.garage;
  const [form, setForm] = useState({
    title: garage?.title || '',
    description: garage?.description || '',
    address: garage?.address || '',
    latitude: garage ? String(garage.latitude) : '',
    longitude: garage ? String(garage.longitude) : '',
    maxVehicleType: garage?.maxVehicleType ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update =
    (key: 'title' | 'description' | 'address' | 'latitude' | 'longitude') =>
    (value: string) =>
      setForm(old => ({ ...old, [key]: value }));
  async function save() {
    setError('');
    const latitude = Number(form.latitude.replace(',', '.'));
    const longitude = Number(form.longitude.replace(',', '.'));
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.address.trim() ||
      !form.latitude.trim() ||
      !form.longitude.trim()
    ) {
      setError('Preencha todos os campos.');
      return;
    }
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      setError('Informe latitude entre -90 e 90 e longitude entre -180 e 180.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        latitude,
        longitude,
      };
      if (garage) {
        await api.put(`/garages/${garage.id}`, payload);
      } else {
        await api.post('/garages', payload);
      }
      navigation.popToTop();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Text style={s.title}>
        {garage ? 'Atualize seu espaço.' : 'Um novo lugar começa aqui.'}
      </Text>
      <Text style={s.subtitle}>
        Conte os detalhes da garagem para quem procura um lugar para estacionar.
      </Text>
      <View style={s.card}>
        <Field
          label="Título do anúncio"
          placeholder="Ex.: Garagem coberta no Centro"
          value={form.title}
          onChangeText={update('title')}
          maxLength={120}
        />
        <Field
          label="Descrição"
          placeholder="Como é o espaço e o acesso?"
          value={form.description}
          onChangeText={update('description')}
          multiline
          maxLength={1500}
        />
        <Field
          label="Endereço completo"
          value={form.address}
          onChangeText={update('address')}
          maxLength={300}
        />
        <Text style={s.label}>Maior veículo aceito</Text>
        <View style={s.row}>
          {vehicles.map((label, index) => (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityState={{ checked: form.maxVehicleType === index }}
              style={[s.button, form.maxVehicleType !== index && s.secondary]}
              onPress={() =>
                setForm(old => ({ ...old, maxVehicleType: index }))
              }
            >
              <Text
                style={[
                  s.buttonText,
                  form.maxVehicleType !== index && { color: colors.blue },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Field
          label="Latitude"
          placeholder="Ex.: -23.55052"
          value={form.latitude}
          onChangeText={update('latitude')}
          keyboardType="numbers-and-punctuation"
        />
        <Field
          label="Longitude"
          placeholder="Ex.: -46.63331"
          value={form.longitude}
          onChangeText={update('longitude')}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={s.caption}>
          Nesta primeira versão, informe as coordenadas manualmente. O mapa será
          integrado em uma próxima etapa.
        </Text>
        <Notice text={error} />
        <Button
          title={garage ? 'Salvar alterações' : 'Cadastrar garagem'}
          onPress={save}
          busy={busy}
        />
      </View>
    </Page>
  );
}

export default function AppRoot() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    restoreServer()
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  function logout() {
    setToken(null);
    setUser(null);
  }
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={s.page}>
        {!ready ? (
          <ActivityIndicator
            accessibilityLabel="Carregando configuração"
            color={colors.blue}
          />
        ) : user ? (
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerTintColor: colors.blue,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.bg },
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="Home" options={{ headerShown: false }}>
                {props => (
                  <Home
                    {...props}
                    user={user}
                    onChange={setUser}
                    onLogout={logout}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Garage"
                options={{ title: 'Detalhes da garagem' }}
              >
                {props => <GarageDetails {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Editor"
                component={GarageEditor}
                options={({ route }) => ({
                  title: route.params.garage
                    ? 'Editar garagem'
                    : 'Anunciar garagem',
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        ) : (
          <Auth onLogin={setUser} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
