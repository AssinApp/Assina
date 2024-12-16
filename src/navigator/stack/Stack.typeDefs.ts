import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParamList = {
  HomeStack: undefined;
  HomeLogged: undefined;
  HomeAuthStack: undefined;
  GerarCodigoStack: { from: string };
  ProfileStack: undefined;
  AssinaturaStack: { from: string };
  LoginStack: { from: string };
  CadastroStack: { from: string };
  // add more screen props...
};

export type StackProps = NativeStackScreenProps<StackParamList, keyof StackParamList>;
