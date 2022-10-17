import React from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import Input from "./Input";
import ButtonWithProgress from "./ButtonWithProgress";

const ProfileCard = (props) => {
  const { displayName, username, image } = props.user;

  const showEditButton = props.isEditable && !props.inEditMode;

  return (
    <div className="card">
      <div className="card-header text-center">
        <ProfileImageWithDefault
          alt="profile"
          width="200"
          height="200"
          image={image}
          src={props.loadedImage}
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body text-center">
        {!props.inEditMode && <h4> {`${displayName}@${username}`} </h4>}
        {props.inEditMode && (
          <div className="mb-2">
            <Input
              value={displayName}
              label={`Change Display Name for ${username}`}
              onChange={props.onChangeDisplayName}
              hasError={props.errors.displayName && true}
              error={props.errors.displayName}
            />
            <div className="mt-2">
              <Input
                type="file"
                onChange={props.onFileSelect}
                hasError={props.errors.image && true}
                error={props.errors.image}
              />
            </div>
          </div>
        )}
        {showEditButton && (
          <button
            className="btn btn-outline-success d-inline-flex"
            onClick={props.onClickEdit}
          >
            {/* <span className="material-icons">edit</span>Edit */}
            <i className="fas fa-user-edit" /> Edit
          </button>
        )}
        {props.inEditMode && (
          <div>
            <ButtonWithProgress
              className="btn btn-primary d-inline-flex"
              onClick={props.onClickSave}
              text={
                <span>
                  {/* <span className="material-icons">save</span>Save */}
                  <i className="fas fa-save" /> Save
                </span>
              }
              pendingApiCall={props.pendingUpdateCall}
              disabled={props.pendingUpdateCall}
            ></ButtonWithProgress>
            <button
              className="btn btn-danger d-inline-flex ms-1"
              onClick={props.onClickCancel}
              disabled={props.pendingUpdateCall}
            >
              {/* <span className="material-icons">cancel</span>Cancel */}
              <i className="fas fa-window-close" /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ProfileCard.defaultProps = {
  errors: {},
};

export default ProfileCard;
