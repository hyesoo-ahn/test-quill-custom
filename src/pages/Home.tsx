import React, { useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { postUploadImage } from "../common/actions";
import { formats } from "../common/quillStyle";

const Clipboard = Quill.import("modules/clipboard");
const Delta = Quill.import("delta");

const Home = () => {
  const [value, setValue] = useState("");
  const quillRef = useRef<any>();

  const imageHandler = () => {
    console.log("에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!");

    // 1. 이미지를 저장할 input type=file DOM을 만든다.
    const input: any = document.createElement("input");
    // 속성 써주기
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
    // input이 클릭되면 파일 선택창이 나타난다.

    // input에 변화가 생긴다면 = 이미지를 선택
    input.addEventListener("change", async () => {
      console.log("온체인지");
      const file = input.files[0];
      // multer에 맞는 형식으로 데이터 만들어준다.
      const formData = new FormData();
      formData.append("img", file); // formData는 키-밸류 구조
      console.log(formData);
      // 백엔드 multer라우터에 이미지를 보낸다.
      try {
        const result = await postUploadImage(formData, 400);
        console.log("성공 시, 백엔드가 보내주는 데이터", result);
        const IMG_URL = result;
        // 이 URL을 img 태그의 src에 넣은 요소를 현재 에디터의 커서에 넣어주면 에디터 내에서 이미지가 나타난다
        // src가 base64가 아닌 짧은 URL이기 때문에 데이터베이스에 에디터의 전체 글 내용을 저장할 수있게된다
        // 이미지는 꼭 로컬 백엔드 uploads 폴더가 아닌 다른 곳에 저장해 URL로 사용하면된다.

        // 이미지 태그를 에디터에 써주기 - 여러 방법이 있다.
        const editor = quillRef.current.getEditor(); // 에디터 객체 가져오기
        // 1. 에디터 root의 innerHTML을 수정해주기
        // editor의 root는 에디터 컨텐츠들이 담겨있다. 거기에 img태그를 추가해준다.
        // 이미지를 업로드하면 -> 멀터에서 이미지 경로 URL을 받아와 -> 이미지 요소로 만들어 에디터 안에 넣어준다.
        // editor.root.innerHTML =
        //   editor.root.innerHTML + `<img src=${IMG_URL} /><br/>`; // 현재 있는 내용들 뒤에 써줘야한다.

        // 2. 현재 에디터 커서 위치값을 가져온다
        const range = editor.getSelection();
        // 가져온 위치에 이미지를 삽입한다
        editor.insertEmbed(range.index, "image", IMG_URL);
      } catch (error) {
        console.log("실패했어요ㅠ");
      }
    });
  };

  const modules = useMemo(() => {
    return {
      clipboard: {
        matchers: [["img", customImage]],
      },
      toolbar: {
        container: [
          ["image"],
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
        ],
        handlers: {
          // 이미지 처리는 우리가 직접 imageHandler라는 함수로 처리할 것이다.
          image: imageHandler,
        },
      },
    };
  }, []);

  // const dataURLtoFile = (dataurl: any, fileName: string) => {
  //   var arr = dataurl.split(","),
  //     mime = arr[0].match(/:(.*?);/)[1],
  //     bstr = atob(arr[1]),
  //     n = bstr.length,
  //     u8arr = new Uint8Array(n);

  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }

  //   return new File([u8arr], fileName, { type: mime });
  // };

  //Usage example:

  async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: "image/png" });
  }

  async function customImage(node: any, delta: any) {
    // base64로 되어있으면 업로드해서 바꿔치기.. 어케해,,?
    const regex =
      /^\s*data:(?<media_type>(?<mime_type>[a-z\-]+\/[a-z\-\+]+)(?<params>(;[a-z\-]+\=[a-z\-]+)*))?(?<encoding>;base64)?,(?<data>[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*)$/i;
    const resultSRC = regex.test(delta.ops[0].insert.image);
    if (resultSRC) {
      const file: any = await dataUrlToFile(delta.ops[0].insert.image, "test");
      console.log(file);
      const formData = new FormData();
      formData.append("img", file);

      // console.log(formData);
      // const getUrl = await postUploadImage(formData, 500);
      // console.log(getUrl);
      // const editor = quillRef.current.getEditor();
      // const range = editor.getSelection();
      // console.log(range.index);
      // return editor.insertEmbed(range.index, "image", getUrl);
    }

    // console.log(delta);
    return delta.compose(new Delta().retain(delta.length(), { img: true }));
  }

  return (
    <div style={{ marginTop: 15 }}>
      <ReactQuill
        ref={quillRef}
        modules={modules}
        formats={formats}
        style={{ height: 500 }}
        theme="snow"
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export default Home;
