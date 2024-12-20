import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHideTabBar } from '../../hook/HideTabBar';
import { LoadingModal } from '../../components/LoadingModal';
import { getUserId } from '../../../utils/stroage';
import { asyncGet, asyncPost } from '../../../utils/fetch';
import { api } from '../../../api/api';


export default function SettingScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<{ label: string; key: string } | null>(null);
  const [modalValue, setModalValue] = useState<string | Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    _id: "",
    userName: "",
    info: "",
    gender: "",
    birthday: "",
    phone: "",
    email: "",
    password: ""
  });

  const fields = [
    { label: "名稱", key: "userName" },
    { label: "簡介", key: "info" },
    { label: "性別", key: "gender" },
    { label: "生日", key: "birthday" },
    { label: "手機號碼", key: "phone" },
    { label: "Email", key: "email" },
  ] as const;

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const id = await getUserId();
        const user = await asyncGet(`${api.find}?_id=${id}`);
        setUserData({
          _id: user.body._id,
          userName: user.body.username,
          info: user.body.info,
          gender: user.body.gender,
          birthday: user.body.birthday,
          phone: user.body.phone,
          email: user.body.email,
          password: user.body.password
        });
      } catch (error) {
        console.error("Failed to fetch user information:", error);
      }
    };
    fetchUserInformation();
  }, []);

  const handleFieldPress = (field: typeof fields[number]) => {
    setSelectedField(field);
    if (field.key === 'birthday') {
      setShowDatePicker(true);
      setModalValue(userData.birthday ? new Date(userData.birthday) : new Date());
    } else {
      setModalValue(userData[field.key as keyof typeof userData] || "");
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (!selectedField) return;
    setUserData(prevData => ({
      ...prevData,
      [selectedField.key]: modalValue instanceof Date
        ? modalValue.toISOString().split('T')[0]
        : modalValue
    }));
    setModalVisible(false);
  };

  const handleDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUserData(prevData => ({
        ...prevData,
        birthday: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSaveAll = async () => {
    try {
      setIsLoading(true);
      const response = await asyncPost(api.update, {
        "_id": userData._id,
        "username": userData.userName,
        "info": userData.info,
        "gender": userData.gender,
        "birthday": userData.birthday,
        "phone": userData.phone,
        "email": userData.email,
        "password": userData.password
      });
      if (response.status === 200) {
        setIsLoading(false);
        navigation.goBack();
      } else {
        throw new Error("回傳資料不正確");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save data:", error);
      Alert.alert("資料修改失敗", "請稍後再試");
    }
  };

  useHideTabBar();

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>修改個人訊息</Text>
          <TouchableOpacity onPress={handleSaveAll}>
            <Text style={styles.saveText}>儲存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarButton}>
            <Image
              style={styles.avatar}
              source={require("../../../assets/Chiikawa.jpg")}
            />
            <Text style={styles.editText}>編輯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoList}>
          {fields.map((field) => (
            <TouchableOpacity
              key={field.key}
              style={styles.infoRow}
              onPress={() => handleFieldPress(field)}
            >
              <Text style={styles.infoLabel}>{field.label}</Text>
              <Text style={styles.infoAction}>
                {field.key === "birthday" && userData[field.key]
                  ? new Date(userData[field.key]).toLocaleDateString()
                  : userData[field.key as keyof typeof userData] || "立刻設定"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={modalValue instanceof Date ? modalValue : new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                {selectedField ? `修改${selectedField.label}` : ''}
              </Text>
              {selectedField?.key === 'gender' ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={modalValue as string}
                    onValueChange={(itemValue) => setModalValue(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="請選擇性別" enabled={false}/>
                    <Picker.Item label="男" value="男" />
                    <Picker.Item label="女" value="女" />
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={styles.modalTextInput}
                  value={modalValue as string}
                  onChangeText={setModalValue}
                  placeholder={selectedField ? `輸入新的${selectedField.label}` : ''}
                />
              )}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                  <Text style={styles.modalButtonText}>儲存</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.modalButtonText}>取消</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <LoadingModal isLoading={isLoading} message="資料更新中..." />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveText: {
    color: "#007bff",
    fontSize: 16,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
    marginTop: 10,
  },
  avatarButton: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
  },
  editText: {
    marginTop: 8,
    fontSize: 14,
    color: "#007bff",
  },
  infoList: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  infoLabel: {
    fontSize: 16,
  },
  infoAction: {
    color: "#007bff",
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 320,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 55,
  },
  modalTextInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});