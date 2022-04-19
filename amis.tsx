/** @jsx h */
import { FC, h, Helmet } from "./nano_jsx.ts";
export const amis = {
  css: [
    "https://cdn.bootcdn.net/ajax/libs/amis/1.9.0-beta.12/sdk.min.css",
    "https://cdn.bootcdn.net/ajax/libs/amis/1.9.0-beta.12/helper.min.css",
    "https://cdn.bootcdn.net/ajax/libs/amis/1.9.0-beta.12/iconfont.css",
  ],
  js: ["https://cdn.bootcdn.net/ajax/libs/amis/1.9.0-beta.12/sdk.min.js"],
};
export const Amis: FC<{ schema?: string | Record<string, any> }> = (props) => (
  <div id="root">
    <Helmet>
      <link
        rel="stylesheet"
        type="text/css"
        href={`"${amis.css[0]}"`}
      />
      <link
        rel="stylesheet"
        type="text/css"
        href={`"${amis.css[1]}"`}
      />
      <link
        rel="stylesheet"
        type="text/css"
        href={`"${amis.css[2]}"`}
      />
    </Helmet>

    <Helmet footer>
      <script src={`"${amis.js[0]}"`} />
      <script type="text/javascript">
        {`
          (function () {
            let amis = amisRequire('amis/embed');
            let amisScoped = amis.embed('#root', ${
          typeof props.schema == "string"
            ? '{"type": "service","schemaApi": "' + props.schema + '"}'
            : JSON.stringify(props.schema)
        });
          })();
        `}
      </script>
    </Helmet>
  </div>
);
