import { Ref, Severity, getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { User } from '../user/user.model';

@modelOptions({
  schemaOptions: {
    collection: 'inventions',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class Invention {
  @prop({ ref: () => User })
  public owner: Ref<User>;

  @prop({ required: true, unique: true })
  public productName: string;

  @prop({ required: true })
  public productCategory: string;

  @prop({ required: true })
  public keyFeatures?: string;

  @prop({ required: true })
  public keyBenefit?: string;

  @prop({ required: true })
  public description: string;

  @prop()
  public size?: string;

  @prop()
  public weight?: string;

  @prop()
  public materialsUsed?: string;

  @prop({ required: true })
  public productPicture: object;

  @prop()
  public productVideo?: object;

  @prop()
  public productDemo?: object;
}

const InventionModel = getModelForClass(Invention);
export default InventionModel;
