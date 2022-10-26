import axios from "axios";
const uri = "https://api.dahandin.com";
// 이미지 업로드(사이즈 지정)
export const postUploadImage = async (
  _file: object,
  _size: number = 500
): Promise<string | boolean> => {
  try {
    // test token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxODllM2RlZmFjYzRiMTdkMzcxN2YyYSIsImlhdCI6MTY2NjI1MjE0MywiZXhwIjoxNjc0MDI4MTQzfQ.F4Vdq2NB6c9UmUh8T-aibJWFIM-XkKf5wrUrSRXc6As
    const token: any = localStorage.getItem("token");
    const { data }: any = await axios.post(
      `${uri}/common/uploadimage?size=${_size}&token=${token}`,
      _file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    return false;
  }
};
